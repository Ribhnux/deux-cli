const path = require('path')
const Listr = require('listr')
const execa = require('execa')
const {commandList} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

const wpcs = path.join(path.dirname(require.resolve('wpcs')), 'bin', 'wpcs')
const themeCheck = path.join(path.dirname(require.resolve('wp-theme-check')), 'bin', 'themecheck')
const w3Validator = path.join(path.dirname(require.resolve('html5-validator')), 'bin', 'html5v')

class ValidateCLI extends CLI {
  constructor(subcmd) {
    super()
    this.subcmd = subcmd
    this.init()
  }

  prepare() {
    if (this.subcmd) {
      this.initSubCommands(this.subcmd)
    } else {
      this.title = '{Theme Validation}'
    }
  }

  /**
   * Validate all
   */
  action() {
    const task = new Listr([
      {
        title: 'WordPress Coding Standard',
        task: () => new Promise((resolve, reject) => {
          execa(wpcs, [this.currentThemePath()])
            .then(() => {
              resolve()
            }).catch(() => {
              reject(new Error(messages.ERROR_INVALID_WPCS))
            })
        })
      },

      {
        title: 'Theme Check and Theme Mentor',
        task: () => new Promise((resolve, reject) => {
          execa(themeCheck, [this.currentThemePath()])
            .then(() => {
              resolve()
            }).catch(() => {
              reject(new Error(messages.ERROR_INVALID_THEME))
            })
        })
      },

      {
        title: 'W3 HTML5 Markup',
        task: () => new Promise((resolve, reject) => {
          execa(w3Validator, [this.getConfig('devUrl')])
            .then(() => {
              resolve()
            }).catch(() => {
              reject(new Error(messages.ERROR_INVALID_W3))
            })
        })
      }
    ])

    task.run().then(() => {
      finish(messages.SUCCEED_VALID_THEME)
    }).catch(exit)
  }

  /**
   * The real action is here
   *
   * @param {String} subcmd
   */
  initSubCommands(subcmd) {
    switch (subcmd) {
      case commandList.STANDARD:
        execa(wpcs, [this.currentThemePath()], {stdio: 'inherit'})
        break

      case commandList.THEME:
        execa(themeCheck, [this.currentThemePath()], {stdio: 'inherit'})
        break

      case commandList.MARKUP:
        execa(w3Validator, [this.getConfig('devUrl')], {stdio: 'inherit'})
        break

      default:
        exit(new Error(messages.ERROR_INVALID_COMMAND))
        break
    }
  }
}

module.exports = ValidateCLI
