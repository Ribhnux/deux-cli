const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, exit, finish} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

module.exports = db => {
  colorlog('Remove {Helpers}')

  getCurrentTheme(db).then(theme => {
    const helperDirPath = path.join(wpThemeDir, theme.details.slug, 'includes', 'helpers')
    const prompts = [
      {
        type: 'checkbox',
        name: 'helpers',
        message: 'Select helpers you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all(theme.helpers.map(
            value => new Promise((resolve, reject) => {
              const helperPath = path.join(helperDirPath, `${value}.php`)
              if (existsSync(helperPath)) {
                wpFileHeader(helperPath).then(info => {
                  resolve({
                    name: info.helperName,
                    value
                  })
                }).catch(reject)
              } else {
                resolve({})
              }
            })
          )).then(helpers => {
            helpers = helpers.filter(item => item.value)

            if (helpers.length > 0) {
              helpers = separatorMaker('Helper List').concat(helpers)
            }

            resolve(helpers)
          }).catch(reject)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({helpers}) => helpers.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({helpers, captcha}) => helpers.length > 0 && captcha,
        default: false,
        message: () => 'Removing helpers from config can\'t be undone. Do you want to continue?'
      }
    ]

    if (theme.helpers.length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({helpers, confirm}) => {
      if (helpers.length === 0 || !confirm) {
        happyExit()
      }

      Promise.all(helpers.map(
        item => new Promise(resolve => {
          const helperPath = path.join(helperDirPath, `${item}.php`)
          if (existsSync(helperPath)) {
            rimraf.sync(helperPath)
          }
          resolve(item)
        })
      )).then(helpers => {
        theme.helpers = theme.helpers.filter(item => !helpers.includes(item))
        saveConfig(db, {
          helpers: theme.helpers
        }).then(finish(message.SUCCEED_REMOVED_HELPER)).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
