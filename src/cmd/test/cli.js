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
    this.subcmd = subcmd
    this.$clioptions = {}
    this.task = {}
    this.init(options)
  }

  prepare() {
    const stdopts = {cwd: this.currentThemePath()}

    if (!this.$init.apiMode()) {
      stdopts.stdio = 'inherit'
    }

    this.$clioptions = this.getTestOptions()
    this.$title = 'Theme {Unit Test, Coding Standard} and {Validation}'

    this.task[commandList.JS] = {
      title: 'Javascript ESLint',
      task: () => new Promise((resolve, reject) => {
        eslint(this.$clioptions.js, stdopts)
          .then(data => resolve(JSON.parse(data)))
          .catch(err => reject(this.$init.apiMode() ? JSON.parse(err.stdout) : new Error(messages.ERROR_INVALID_JS)))
      })
    }

    this.task[commandList.SASS] = {
      title: 'SASS Stylelint',
      task: () => new Promise((resolve, reject) => {
        stylelint(this.$clioptions.sass, stdopts)
          .then(data => resolve(JSON.parse(data)))
          .catch(err => reject(this.$init.apiMode() ? JSON.parse(err.stdout) : new Error(messages.ERROR_INVALID_SASS)))
      })
    }

    this.task[commandList.WPCS] = {
      title: 'WordPress Coding Standard',
      task: () => new Promise((resolve, reject) => {
        wpcs(this.$clioptions.wpcs, stdopts)
          .then(() => resolve())
          .catch(() => reject(new Error(messages.ERROR_INVALID_WPCS)))
      })
    }

    this.task[commandList.THEMECHECK] = {
      title: 'Theme Check and Theme Mentor',
      task: () => new Promise((resolve, reject) => {
        themecheck(this.$clioptions.themecheck, stdopts)
          .then(() => resolve())
          .catch(() => reject(new Error(messages.ERROR_INVALID_THEMECHECK)))
      })
    }

    this.task[commandList.W3] = {
      title: 'W3 HTML5 Markup',
      task: () => new Promise((resolve, reject) => {
        w3Validator(this.$clioptions.w3Validator, stdopts)
          .then(() => resolve())
          .catch(() => reject(new Error(messages.ERROR_INVALID_W3)))
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
    const loader = this.$logger.loader('')

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
      if (this.$init.apiMode()) {
        finalMessage = {
          message: messages.SUCCEED_VALID_CODES,
          data
        }
      } else {
        finalMessage = messages.SUCCEED_VALID_CODES
      }

      loader.stop()

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
