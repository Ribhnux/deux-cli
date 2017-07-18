const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

module.exports = db => {
  colorlog('Remove {Components}')

  getCurrentTheme(db).then(theme => {
    const componentDirPath = path.join(wpThemeDir, theme.details.slug, 'components')
    const prompts = [
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select components you want to remove',
        choices: () => new Promise(resolve => {
          Promise.all(theme.components.map(
            value => new Promise(resolve => {
              const componentPath = path.join(componentDirPath, `${value}.php`)
              if (existsSync(componentPath)) {
                wpFileHeader(componentPath).then(info => {
                  resolve({
                    name: info.componentName,
                    value
                  })
                })
              } else {
                resolve({})
              }
            })
          )).then(components => {
            components = components.filter(item => item.value)

            if (components.length > 0) {
              components = separatorMaker('Component List').concat(components)
            }

            resolve(components)
          })
        })
      },

      Object.assign(captchaMaker(), {
        when: ({components}) => components.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({components, captcha}) => components.length > 0 && captcha,
        default: false,
        message: () => 'Removing components from config can\'t be undone. Do you want to continue?'
      }
    ]

    if (theme.components.length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({components, confirm}) => {
      if (components.length === 0 || !confirm) {
        happyExit()
      }

      const filterList = []

      components.forEach(item => {
        filterList.push(item)

        const componentPath = path.join(componentDirPath, `${item}.php`)
        if (existsSync(componentPath)) {
          rimraf.sync(componentPath)
        }
      })

      theme.components = theme.components.filter(item => !item.includes(filterList))

      saveConfig(db, {
        components: theme.components
      }).then(() => {
        done({
          message: message.SUCCEED_REMOVED_COMPONENT,
          padding: true,
          exit: true
        })
      })
    })
  })
}
