const {existsSync} = require('fs')
const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')
const {happyExit, captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveHelper extends CLI {
  constructor() {
    super()
    this.themeHelpers = undefined
    this.init()
  }

  /**
   * Setup remove helper prompts
   */
  prepare() {
    this.themeHelpers = this.themeInfo('helpers')

    if (this.themeHelpers.length === 0) {
      happyExit()
    }

    this.title = 'Remove {Helpers}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'helpers',
        message: 'Select helpers you want to remove',
        choices: () => new Promise((resolve, reject) => {
          const helpersException = this.themeHelpers.filter(
            item => ![
              'custom-background',
              'custom-header-video',
              'custom-header'
            ].includes(item)
          )

          Promise.all(helpersException.map(
            value => new Promise((resolve, reject) => {
              const helperPath = this.currentThemePath('includes', 'helpers', `${value}.php`)
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
  }

  /**
   * Remove helpers file and config
   *
   * @param {Object} {helpers, confirm}
   */
  action({helpers, confirm}) {
    if (helpers.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(helpers.map(
      item => new Promise(resolve => {
        const helperPath = this.currentThemePath('includes', 'helpers', `${item}.php`)
        if (existsSync(helperPath)) {
          rimraf.sync(helperPath)
        }
        resolve(item)
      })
    )).then(helpers => {
      Promise.all([
        new Promise(resolve => {
          this.themeHelpers = this.themeHelpers.filter(item => !helpers.includes(item))
          this.setThemeConfig({
            helpers: this.themeHelpers
          })

          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_HELPER)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveHelper
