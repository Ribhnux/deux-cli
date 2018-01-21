const path = require('path')
const {existsSync} = require('fs')
const Listr = require('listr')
const execa = require('execa')
const {commandList} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')

const wpcs = path.join(global.bin.path, 'wpcs')
const themeCheck = path.join(global.bin.path, 'themecheck')
const w3Validator = path.join(global.bin.path, 'html5v')
const stylelint = path.join(global.bin.path, 'stylelint')

class TestCLI extends CLI {
  constructor(subcmd, options) {
    super()
    this.$clioptions = {}
    this.$subcmd = subcmd
    this.init(options)
  }

  prepare() {
    this.$clioptions.wpcs = ['--excludes=woocommerce']
    this.$clioptions.themeCheck = ['.']
    this.$clioptions.w3 = [this.getConfig('devUrl')]

    let stylelintrc = '.stylelintrc'
    if (!existsSync(this.currentThemePath('.stylelintrc'))) {
      stylelintrc = this.templateSourcePath('.stylelintrc')
    }

    this.$clioptions.sass = [
      '--config',
      stylelintrc,
      '--config-basedir',
      path.dirname(global.bin.path),
      ...[
        path.join('assets-src', 'sass', '**'),
        path.join('includes', 'customizer', 'assets-src', 'sass', '**')
      ]
    ]

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
    const task = new Listr([
      {
        title: 'ESLint for Javascript',
        task: () => new Promise(resolve => {
          resolve()
        })
      },

      {
        title: 'Stylelint for SASS',
        task: () => new Promise((resolve, reject) => {
          execa(stylelint, this.$clioptions.sass, {cwd: this.currentThemePath()})
            .then(() => {
              resolve()
            }).catch(() => {
              reject(new Error(messages.ERROR_INVALID_SASS))
            })
        })
      },

      {
        title: 'WordPress Coding Standard',
        task: () => new Promise((resolve, reject) => {
          execa(wpcs, this.$clioptions.wpcs, {cwd: this.currentThemePath()})
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
          execa(themeCheck, this.$clioptions.themeCheck, {cwd: this.currentThemePath()})
            .then(() => {
              resolve()
            }).catch(() => {
              reject(new Error(messages.ERROR_INVALID_THEMECHECK))
            })
        })
      },

      {
        title: 'W3 HTML5 Markup',
        task: () => new Promise((resolve, reject) => {
          execa(w3Validator, this.$clioptions.w3, {cwd: this.currentThemePath()})
            .then(() => {
              resolve()
            }).catch(err => {
              reject(err)
            })
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
    switch (subcmd) {
      case commandList.SASS:
        // console.log(stylelint, this.$clioptions.sass)
        execa.stdout(stylelint, this.$clioptions.sass, {stdio: 'inherit', cwd: this.currentThemePath()})
          .then(() => this.$logger.finish(messages.SUCCEED_VALID_CODES))
          .catch(() => this.$logger.exit(messages.ERROR_FIX_INVALID_CODES))
        break

      case commandList.WPCS:
        execa.stdout(wpcs, this.$clioptions.wpcs, {stdio: 'inherit', cwd: this.currentThemePath()})
          .then(() => this.$logger.finish(messages.SUCCEED_VALID_CODES))
          .catch(() => this.$logger.exit(messages.ERROR_FIX_INVALID_CODES))
        break

      case commandList.THEMECHECK:
        execa.stdout(themeCheck, this.$clioptions.themeCheck, {stdio: 'inherit', cwd: this.currentThemePath()})
          .then(() => this.$logger.finish(messages.SUCCEED_VALID_CODES))
          .catch(() => this.$logger.exit(messages.ERROR_FIX_INVALID_CODES))
        break

      case commandList.W3:
        execa.stdout(w3Validator, this.$clioptions.w3, {stdio: 'inherit', cwd: this.currentThemePath()})
          .then(() => this.$logger.finish(messages.SUCCEED_VALID_CODES))
          .catch(() => this.$logger.exit(messages.ERROR_FIX_INVALID_CODES))
        break

      default:
        this.$logger.exit(new Error(messages.ERROR_INVALID_COMMAND))
        break
    }
  }
}

module.exports = TestCLI
