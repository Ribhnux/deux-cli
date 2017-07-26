const path = require('path')
const {existsSync, writeFileSync} = require('fs')
const Listr = require('listr')
const execa = require('execa')
const inquirer = require('inquirer')
const jsonr = require('json-realtime')
const {dbTypes, dbPath} = require('./fixtures')
const messages = require('./messages')

const {colorlog, error, done, exit} = global.deuxhelpers.require('logger')
const validator = global.deuxhelpers.require('util/validator')

class Init {
  constructor() {
    this.skip = false
    this.db = null
  }

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

  check() {
    return new Promise(resolve => {
      if (!existsSync(dbPath)) {
        error({
          message: messages.ERROR_PROJECT_FILE_NOT_EXISTS,
          paddingTop: true
        })

        const defaultDb = {
          [dbTypes.CONFIG]: undefined,
          [dbTypes.CURRENT]: {},
          [dbTypes.THEMES]: {}
        }

        writeFileSync(dbPath, JSON.stringify(defaultDb))
      }

      this.db = jsonr(dbPath)

      if (Object.keys(this.db[dbTypes.THEMES]).length === 0 && this.skip === false) {
        this.notice()
      }

      if (this.db[dbTypes.CONFIG]) {
        return resolve(this.db)
      }

      this.setup().then(() => {
        this.notice(false)
        resolve(this.db)
      }).catch(exit)
    })
  }

  setup() {
    return new Promise(resolve => {
      colorlog('{Init Project}')

      const task = new Listr([
        {
          title: 'Prerequisite check',
          task: () => new Listr([
            {
              title: 'Install PHP',
              task: () => execa.stdout('php', ['--version'])
            },

            {
              title: 'Install Git',
              task: () => execa.stdout('git', ['--version'])
            }
          ])
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
          resolve(this.db)
        })
      }).catch(exit)
    })
  }
}

module.exports = Init
