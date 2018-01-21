const Listr = require('listr')
const {commandList} = require('./fixtures')
const {
  wpcs,
  themecheck,
  w3Validator,
  stylelint,
  eslint
} = require('./task')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')

class TestCLI extends CLI {
  constructor(subcmd, options) {
    super()
    this.$subcmd = subcmd
    this.$clioptions = {}
    this.init(options)
  }

  prepare() {
    this.$clioptions = this.getTestOptions()

    if (this.$subcmd) {
      this.initSubCommands(this.$subcmd)
    } else {
      this.$title = 'Theme {Unit Test, Coding Standard} and {Validation}'
    }
  }

  /**
   * Validate all
   */
  action() {
    const stdopts = {
      cwd: this.currentThemePath()
    }

    const task = new Listr([
      {
        title: 'ESLint for Javascript',
        task: () => new Promise((resolve, reject) => {
          eslint(this.$clioptions.js, stdopts)
            .then(() => resolve())
            .catch(() => reject(new Error(messages.ERROR_INVALID_JS)))
        })
      },

      {
        title: 'Stylelint for SASS',
        task: () => new Promise((resolve, reject) => {
          stylelint(this.$clioptions.sass, stdopts)
            .then(() => resolve())
            .catch(() => reject(new Error(messages.ERROR_INVALID_SASS)))
        })
      },

      {
        title: 'WordPress Coding Standard',
        task: () => new Promise((resolve, reject) => {
          wpcs(this.$clioptions.wpcs, stdopts)
            .then(() => resolve())
            .catch(() => reject(new Error(messages.ERROR_INVALID_WPCS)))
        })
      },

      {
        title: 'Theme Check and Theme Mentor',
        task: () => new Promise((resolve, reject) => {
          themecheck(this.$clioptions.themecheck, stdopts)
            .then(() => resolve())
            .catch(() => reject(new Error(messages.ERROR_INVALID_THEMECHECK)))
        })
      },

      {
        title: 'W3 HTML5 Markup',
        task: () => new Promise((resolve, reject) => {
          w3Validator(this.$clioptions.w3Validator, stdopts)
            .then(() => resolve())
            .catch(() => reject(new Error(messages.ERROR_INVALID_W3)))
        })
      }
    ])

    task.run().then(() => {
      this.$logger.finish(messages.SUCCEED_VALID_THEME)
    }).catch(this.$logger.exit)
  }

  /**
   * The real action is here
   *
   * @param {String} subcmd
   */
  initSubCommands(subcmd) {
    const stdopts = {stdio: 'inherit', cwd: this.currentThemePath()}
    let runCli

    switch (subcmd) {
      case commandList.JS:
        runCli = eslint(this.$clioptions.js, stdopts)
        break

      case commandList.SASS:
        runCli = stylelint(this.$clioptions.sass, stdopts)
        break

      case commandList.WPCS:
        runCli = wpcs(this.$clioptions.wpcs, stdopts)
        break

      case commandList.THEMECHECK:
        runCli = themecheck(this.$clioptions.themecheck, stdopts)
        break

      case commandList.W3:
        runCli = w3Validator(this.$clioptions.w3Validator, stdopts)
        break

      default:
        this.$logger.exit(new Error(messages.ERROR_INVALID_COMMAND))
        break
    }

    if (runCli) {
      runCli
        .then(() => this.$logger.finish(messages.SUCCEED_VALID_CODES))
        .catch(() => this.$logger.exit(messages.ERROR_FIX_INVALID_CODES))
    }
  }
}

module.exports = TestCLI
