const {writeFileSync, existsSync} = require('fs')
const jsonr = require('json-realtime')
const Listr = require('listr')
const inquirer = require('inquirer')
const execa = require('execa')
const {dbTypes} = require('./const')
const {errHandler: dbErrorHandler} = require('./utils')

const message = global.const.require('messages')
const {wpConfigPath, dbPath} = global.const.require('path')
const {colorlog, error, done} = global.helpers.require('logger')
const validator = global.helpers.require('util/validator')

const succeed = () => {
  error({
    message: message.ERROR_NO_THEME,
    paddingTop: true
  })
  done({
    message: message.CREATE_NEW_THEME,
    paddingBottom: true,
    exit: true
  })
}

const initProject = db => {
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
    },
    {
      title: 'WordPress installation check',
      task: () => new Promise((resolve, reject) => {
        if (!existsSync(wpConfigPath)) {
          reject(new Error(message.ERROR_NOT_WP_FOLDER))
        }

        resolve()
      })
    }
  ])

  const prompts = [
    {
      name: 'config.devUrl',
      message: 'What is Your Local WordPress Development URL?'
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
    colorlog('Setup {Environment Config}')
    inquirer.prompt(prompts).then(answers => {
      db[dbTypes.ENVIRONMENT] = answers.config
      succeed()
    })
  }).catch(dbErrorHandler)
}

module.exports = skip => new Promise(resolve => {
  if (!existsSync(wpConfigPath)) {
    error({
      message: message.ERROR_NOT_WP_FOLDER,
      padding: true,
      exit: true
    })
  }

  if (!existsSync(dbPath)) {
    error({
      message: message.ERROR_PROJECT_FILE_NOT_EXISTS,
      paddingTop: true
    })

    const defaultDb = {
      [dbTypes.ENVIRONMENT]: undefined,
      [dbTypes.CURRENT]: undefined,
      [dbTypes.THEMES]: {}
    }
    writeFileSync(dbPath, JSON.stringify(defaultDb))
  }

  const db = jsonr(dbPath)

  if (!db[dbTypes.ENVIRONMENT]) {
    initProject(db)
    return
  }

  if (skip) {
    resolve(db)
    return
  }

  if (!db[dbTypes.CURRENT]) {
    succeed()
  }

  resolve(db)
})
