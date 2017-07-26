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
  colorlog('Remove {Libraries}')

  getCurrentTheme(db).then(theme => {
    const libDirectory = path.join(wpThemeDir, theme.details.slug, 'includes', 'libraries')
    const prompts = [
      {
        type: 'checkbox',
        name: 'libraries',
        message: 'Select libraries you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all(theme.libraries.map(
            value => new Promise((resolve, reject) => {
              const libPath = path.join(libDirectory, `${value}.php`)
              if (existsSync(libPath)) {
                wpFileHeader(libPath).then(info => {
                  let resolver = {}

                  if (info.className) {
                    resolver = {
                      name: info.className,
                      value
                    }
                  }

                  resolve(resolver)
                }).catch(reject)
              } else {
                resolve({})
              }
            })
          )).then(libraries => {
            libraries = libraries.filter(item => item.value)

            if (libraries.length > 0) {
              libraries = separatorMaker('Library List').concat(libraries)
            } else {
              reject()
            }

            resolve(libraries)
          }).catch(reject)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({libraries}) => libraries.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({libraries, captcha}) => libraries.length > 0 && captcha,
        default: false,
        message: () => 'Removing libraries from config can\'t be undone. Do you want to continue?'
      }
    ]

    if (theme.libraries.length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({libraries, confirm}) => {
      if (libraries.length === 0 || !confirm) {
        happyExit()
      }

      Promise.all(libraries.map(
        item => new Promise(resolve => {
          const libPath = path.join(libDirectory, `${item}.php`)
          if (existsSync(libPath)) {
            rimraf.sync(libPath)
          }
          resolve(item)
        })
      )).then(libraries => {
        theme.libraries = theme.libraries.filter(item => !libraries.includes(item))

        saveConfig(db, {
          libraries: theme.libraries
        }).then(finish(message.SUCCEED_REMOVED_LIBCLASS)).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
