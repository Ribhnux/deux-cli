const Listr = require('listr')
const isJSON = require('is-json')
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
    this.subcmd = subcmd
    this.$clioptions = {}
    this.task = {}
    this.init(options)
  }

  /**
   * Get message after subcommands cli run.
   *
   * @param {String} data
   * @param {String} defaultMsg
   */
  getMessage(data, defaultMsg) {
    let msg = ''

    if (this.$init.apiMode()) {
      if (isJSON(data.stdout)) {
        msg = JSON.parse(data.stdout)
      } else {
        msg = new Error(messages.ERROR_INVALID_API)
      }
    } else {
      msg  = new Error(defaultMsg)
    }

    return msg
  }

  /**
   * Make preparation before validating.
   */
  prepare() {
    const stdopts = {cwd: this.currentThemePath()}

    if (!this.$init.apiMode()) {
      stdopts.stdio = 'inherit'
      stdopts.maxBuffer = 10 * (1024 * 1024)
    }

    this.$clioptions = this.getTestOptions()
    this.$title = 'Theme {Unit Test, Coding Standard} and {Validation}'

    this.task[commandList.JS] = {
      title: 'Javascript ESLint',
      task: () => new Promise((resolve, reject) => {
        eslint(this.$clioptions.js, stdopts)
          .then(data => resolve(this.getMessage(data)))
          .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_JS)))
      })
    }

    this.task[commandList.SASS] = {
      title: 'SASS Stylelint',
      task: () => new Promise((resolve, reject) => {
        stylelint(this.$clioptions.sass, stdopts)
          .then(data => resolve(this.getMessage(data)))
          .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_SASS)))
      })
    }

    this.task[commandList.WPCS] = {
      title: 'WordPress Coding Standard',
      task: () => new Promise((resolve, reject) => {
        wpcs(this.$clioptions.wpcs, stdopts)
          .then(data => resolve(this.getMessage(data)))
          .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_WPCS)))
      })
    }

    this.task[commandList.THEMECHECK] = {
      title: 'Theme Check and Theme Mentor',
      task: () => new Promise((resolve, reject) => {
        themecheck(this.$clioptions.themecheck, stdopts)
          .then(data => resolve(this.getMessage(data)))
          .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_THEMECHECK)))
      })
    }

    this.task[commandList.W3] = {
      title: 'W3 HTML5 Markup',
      task: () => new Promise((resolve, reject) => {
        w3Validator(this.$clioptions.w3Validator, stdopts)
          .then(data => resolve(this.getMessage(data)))
          .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_W3)))
      })
    }

    if (this.subcmd) {
      switch (this.subcmd) {
        case commandList.JS:
          this.$title = this.task[commandList.JS].title
          break

        case commandList.SASS:
          this.$title = this.task[commandList.SASS].title
          break

        case commandList.WPCS:
          this.$title = this.task[commandList.WPCS].title
          break

        case commandList.THEMECHECK:
          this.$title = this.task[commandList.THEMECHECK].title
          break

        case commandList.W3:
          this.$title = this.task[commandList.W3].title
          break

        default: break
      }
    }
  }

  /**
   * Validate all
   */
  action() {
    if (this.subcmd) {
      this.initSubCommands()
    } else {
      if (this.$init.apiMode()) {
        this.$logger.happyExit(messages.ERROR_API_MODE_AVAILABILITY)
      }

      const task = new Listr([
        this.task[commandList.JS],
        this.task[commandList.SASS],
        this.task[commandList.WPCS],
        this.task[commandList.THEMECHECK],
        this.task[commandList.W3]
      ])

      task.run().then(() => {
        this.$logger.finish(messages.SUCCEED_VALID_THEME)
      }).catch(this.$logger.exit)
    }
  }

  /**
   * The real action is here
   */
  initSubCommands() {
    let cli

    if ([commandList.JS, commandList.SASS].includes(this.subcmd)) {
      this.loader = this.$logger.loader('')
    }

    switch (this.subcmd) {
      case commandList.JS:
        cli = this.task[commandList.JS].task()
        break

      case commandList.SASS:
        cli = this.task[commandList.SASS].task()
        break

      case commandList.WPCS:
        cli = this.task[commandList.WPCS].task()
        break

      case commandList.THEMECHECK:
        cli = this.task[commandList.THEMECHECK].task()
        break

      case commandList.W3:
        cli = this.task[commandList.W3].task()
        break

      default:
        this.$logger.exit(new Error(messages.ERROR_INVALID_COMMAND))
        break
    }

    const finalLogger = (isErr, data) => {
      let finalMessage

      if ([commandList.JS, commandList.SASS].includes(this.subcmd)) {
        this.loader.stop()
      }

      if (isErr) {
        finalMessage = messages.ERROR_FIX_INVALID_CODES
      } else {
        finalMessage = messages.SUCCEED_VALID_CODES
      }

      if (this.$init.apiMode()) {
        finalMessage = {
          message: finalMessage
        }

        if (Object.keys(data).length > 0) {
          finalMessage.data = data
        }
      }

      if (isErr) {
        this.$logger.exit(finalMessage)
      } else {
        this.$logger.finish(finalMessage)
      }
    }

    if (cli) {
      cli
        .then(data => finalLogger(false, data))
        .catch(err => finalLogger(true, err))
    }
  }
}

module.exports = TestCLI
