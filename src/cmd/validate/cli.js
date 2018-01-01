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
  constructor(subcmd, options) {
    super()
    this.$clioptions = {}
    this.$subcmd = subcmd
    this.init(options)
  }

  prepare() {
    this.$clioptions.wpcs = [this.currentThemePath(), '--excludes=woocommerce']
    this.$clioptions.themeCheck = []
    this.$clioptions.w3 = [this.getConfig('devUrl')]

    if (this.$subcmd) {
      this.initSubCommands(this.$subcmd)
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
          execa(wpcs, this.$clioptions.wpcs)
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
          execa(themeCheck, this.$clioptions.themeCheck)
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
          execa(w3Validator, this.$clioptions.w3)
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
        execa(wpcs, this.$clioptions.wpcs, {stdio: 'inherit'})
        break

      case commandList.THEME:
        execa(themeCheck, this.$clioptions.themeCheck, {stdio: 'inherit'})
        break

      case commandList.MARKUP:
        execa(w3Validator, this.$clioptions.w3, {stdio: 'inherit'})
        break

      default:
        exit(new Error(messages.ERROR_INVALID_COMMAND))
        break
    }
  }
}

module.exports = ValidateCLI
