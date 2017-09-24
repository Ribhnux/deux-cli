const path = require('path')
const {statSync, existsSync, writeFile} = require('fs')
const Listr = require('listr')
const execa = require('execa')
const inquirer = require('inquirer')
const jsonr = require('json-realtime')
const {dbTypes, dbPath} = require('./fixtures')
const message = require('./messages')

const {colorlog, versionlog, error, done, exit} = global.deuxhelpers.require('logger')
const validator = global.deuxhelpers.require('util/validator')
const {isJSON} = global.deuxhelpers.require('util/misc')

class Init {
  constructor(skip = false, options = {}) {
    this.$skip = skip
    this.$dbPath = dbPath
    this.$db = null
    this.$input = null
    this.$apiMode = false

    if (options.db) {
      const dbDir = path.dirname(options.db)
      if (existsSync(dbDir) && statSync(dbDir).isDirectory()) {
        this.$dbPath = options.db
      }
    }

    if (options.input) {
      const json = isJSON(options.input)
      if (json && json.wpPath && json.devUrl) {
        this.$apiMode = true
        this.$input = json
      } else {
        exit(message.ERROR_INVALID_CONFIG, true)
      }
    }

    if (options.api) {
      this.$apiMode = true
    }

    if (!this.$apiMode) {
      versionlog()
    }
  }

  /**
   * Show notice message to create new theme
   *
   * @param {Boolean} isExit
   */
  notice(isExit = false) {
    if (this.$apiMode === false) {
      error({
        message: message.ERROR_NO_THEME,
        paddingTop: true
      })
      done({
        message: message.CREATE_NEW_THEME,
        paddingBottom: true,
        exit: isExit
      })
    } else {
      const msg = [
        message.ERROR_NO_THEME,
        message.CREATE_NEW_THEME
      ]

      done({
        isRaw: true,
        message: {
          message: msg
        },
        exit: isExit
      })
    }
  }

  /**
   * Check if theme has been initialized
   */
  initialized() {
    return this.$db &&
      typeof this.$db[dbTypes.CONFIG] === 'object' &&
      'wpPath' in this.$db[dbTypes.CONFIG] &&
      'devUrl' in this.$db[dbTypes.CONFIG]
  }

  /**
   * Check, whether config has been initialized or not
   */
  check() {
    const checkDbExistence = () => new Promise(resolve => {
      if (existsSync(this.$dbPath) === false) {
        if (!this.$apiMode) {
          error({
            message: message.ERROR_PROJECT_FILE_NOT_EXISTS,
            paddingTop: true
          })
        }

        const defaultDb = {
          [dbTypes.CONFIG]: undefined,
          [dbTypes.CURRENT]: {},
          [dbTypes.THEMES]: {}
        }

        writeFile(this.$dbPath, JSON.stringify(defaultDb), err => {
          if (err) {
            exit(err)
          }

          this.$db = jsonr(this.$dbPath)
          resolve()
        })
      } else {
        this.$db = jsonr(this.$dbPath)
        resolve()
      }
    })

    return new Promise(resolve => {
      checkDbExistence().then(() => {
        Promise.all([
          // Check if init has been skipped
          new Promise(resolve => {
            resolve(this.initialized() && this.$skip)
          }),

          // Check if database have no theme
          new Promise(resolve => {
            resolve(
              this.initialized() &&
              Object.keys(this.$db[dbTypes.THEMES]).length === 0
            )
          }),

          // Check if it already have current theme
          new Promise(resolve => {
            resolve(
              this.initialized() &&
              Object.keys(this.$db[dbTypes.CURRENT]).length > 0
            )
          })
        ]).then(resolver => {
          const skip = resolver[0]
          const zeroTheme = resolver[1]
          const hasCurrentTheme = resolver[2]

          if (skip || (hasCurrentTheme && skip === false)) {
            return resolve(this.$db)
          }

          if (zeroTheme && skip === false) {
            this.notice(true)
          }

          this.setup().then(() => {
            if (!hasCurrentTheme && !skip) {
              this.notice(true)
            }

            resolve(this.$db)
          }).catch(err => {
            exit(err, this.$apiMode)
          })
        })
      }).catch(err => {
        exit(err, this.$apiMode)
      })
    })
  }

  /**
   * Initial setup
   */
  setup() {
    return new Promise(resolve => {
      if (!this.$apiMode) {
        colorlog('Prerequisite check')
      }

      const task = new Listr([
        {
          title: 'Install PHP',
          task: () => execa.stdout('php', ['--version'])
        },

        {
          title: 'Install Git',
          task: () => execa.stdout('git', ['--version'])
        }
      ])

      const prompts = [
        {
          name: 'config.wpPath',
          message: 'Where is your WordPress installation directory?',
          validate: value => {
            if (!existsSync(path.join(value, 'wp-config.php'))) {
              return message.ERROR_NOT_WP_FOLDER
            }

            return true
          }
        },

        {
          name: 'config.devUrl',
          message: 'What is your local WordPress development URL?'
        },

        {
          type: 'confirm',
          name: 'useApiKey',
          message: 'Is your project need Web Fonts?'
        },

        {
          name: 'config.fontApiKey',
          message: 'Google Fonts API Key?',
          when: ({useApiKey}) => useApiKey,
          validate: value => validator(value, {fontApiKey: true})
        }
      ]

      if (this.$apiMode && this.$input) {
        this.$db[dbTypes.CONFIG] = this.$input
        resolve()
      } else {
        task.run().then(() => {
          colorlog('Setup {Config}')

          inquirer.prompt(prompts).then(({config}) => {
            this.$db[dbTypes.CONFIG] = config
            resolve()
          })
        }).catch(err => {
          exit(err, this.$apiMode)
        })
      }
    })
  }

  /**
   * Check whether is in api mode or not.
   */
  apiMode() {
    return this.$apiMode
  }
}

module.exports = Init
