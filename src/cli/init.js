const path = require('path')
const {existsSync, writeFile} = require('fs')
const Listr = require('listr')
const execa = require('execa')
const inquirer = require('inquirer')
const jsonr = require('json-realtime')
const {dbTypes, dbPath} = require('./fixtures')
const messages = require('./messages')

const {colorlog, error, done, exit} = global.deuxhelpers.require('logger')
const validator = global.deuxhelpers.require('util/validator')

class Init {
  constructor(skip = false, moreInfo = false) {
    this.moreInfo = moreInfo
    this.skip = skip
    this.db = null
  }

  /**
   * Show notice message to create new theme
   *
   * @param {Boolean} isExit
   */
  notice(isExit = false) {
    error({
      message: messages.ERROR_NO_THEME,
      paddingTop: true
    })
    done({
      message: messages.CREATE_NEW_THEME,
      paddingBottom: true,
      exit: isExit
    })
  }

  /**
   * Check if theme has been initialized
   */
  initialized() {
    return this.db &&
      typeof this.db[dbTypes.CONFIG] === 'object' &&
      'wpPath' in this.db[dbTypes.CONFIG] &&
      'devUrl' in this.db[dbTypes.CONFIG]
  }

  /**
   * Check, whether config has been initialized or not
   */
  check() {
    return new Promise(resolve => {
      Promise.all([
        new Promise(resolve => {
          if (existsSync(dbPath) === false) {
            error({
              message: messages.ERROR_PROJECT_FILE_NOT_EXISTS,
              paddingTop: true
            })

            const defaultDb = {
              [dbTypes.CONFIG]: undefined,
              [dbTypes.CURRENT]: {},
              [dbTypes.THEMES]: {}
            }

            writeFile(dbPath, JSON.stringify(defaultDb), err => {
              if (err) {
                exit(err)
              }

              this.db = jsonr(dbPath)
              resolve()
            })
          } else {
            this.db = jsonr(dbPath)
            resolve()
          }
        }),

        // Check if init has been skipped
        new Promise(resolve => {
          resolve(this.initialized() && this.skip)
        }),

        // Check if database have no theme
        new Promise(resolve => {
          resolve(
            this.initialized() &&
            Object.keys(this.db[dbTypes.THEMES]).length === 0
          )
        }),

        // Check if it already have current theme
        new Promise(resolve => {
          resolve(
            this.initialized() &&
            Object.keys(this.db[dbTypes.CURRENT]).length > 0
          )
        })
      ]).then(resolver => {
        const skip = resolver[1]
        const zeroTheme = resolver[2]
        const hasCurrentTheme = resolver[3]

        if (skip || (hasCurrentTheme && skip === false)) {
          return resolve(this.db)
        }

        if (zeroTheme && skip === false) {
          this.notice(true)
        }

        if (this.moreInfo) {
          return resolve()
        }

        this.setup().then(() => {
          if (!hasCurrentTheme && !skip) {
            this.notice(true)
          }

          resolve(this.db)
        }).catch(exit)
      })
    })
  }

  /**
   * Initial setup
   */
  setup() {
    return new Promise(resolve => {
      colorlog('Prerequisite check')

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
              return messages.ERROR_NOT_WP_FOLDER
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

      task.run().then(() => {
        colorlog('Setup {Config}')

        inquirer.prompt(prompts).then(({config}) => {
          this.db[dbTypes.CONFIG] = config
          resolve()
        })
      }).catch(exit)
    })
  }
}

module.exports = Init
