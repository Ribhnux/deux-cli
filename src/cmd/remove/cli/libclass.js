const {existsSync} = require('fs')
const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveLibClass extends CLI {
  constructor() {
    super()
    this.themeLibraries = undefined
    this.init()
  }

  /**
   * Setup remove libclass rompts
   */
  prepare() {
    this.themeLibraries = this.themeInfo('libraries')

    if (this.themeLibraries.length === 0) {
      happyExit()
    }

    this.title = 'Remove {Libraries}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'libraries',
        message: 'Select libraries you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all(this.themeLibraries.map(
            value => new Promise((resolve, reject) => {
              const libPath = this.currentThemePath('includes', 'libraries', `${value}.php`)
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
  }

  action({libraries, confirm}) {
    if (libraries.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(libraries.map(
      item => new Promise(resolve => {
        const libPath = this.currentThemePath('includes', 'libraries', `${item}.php`)
        if (existsSync(libPath)) {
          rimraf.sync(libPath)
        }
        resolve(item)
      })
    )).then(libraries => {
      Promise.all([
        new Promise(resolve => {
          this.themeLibraries = this.themeLibraries.filter(item => !libraries.includes(item))
          resolve()
        }),

        new Promise(resolve => {
          this.setThemeConfig({
            libraries: this.themeLibraries
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_LIBCLASS)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveLibClass
