import {existsSync} from 'fs'
import Listr from 'listr'
import inquirer from 'inquirer'
import execa from 'execa'
import PouchDB from 'pouchdb'
import dbUpsert from 'pouchdb-upsert'
import dbFind from 'pouchdb-find'
import * as message from '../lib/messages'
import {wpConfigPath, dbPath, status} from '../lib/const'
import {colorlog, error, done} from '../lib/logger'
import {dbErrorHandler} from '../lib/db-utils'

// PouchDB: Config
// PouchDB.debug.enable('pouchdb:find')

// PouchDB: Plugins
PouchDB.plugin(dbUpsert)
PouchDB.plugin(dbFind)

export default skip => {
  return new Promise(resolve => {
    const env = 'deux.env'
    const current = 'deux.current'
    const db = new PouchDB(dbPath)

    const initProject = () => {
      colorlog(`{Init Project}`)

      const task = new Listr([
        {
          title: 'Check Prerequisite',
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
          title: 'Check WP Installation',
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
          name: 'devUrl',
          message: 'What is WordPress Development URL?'
        }
      ]

      task.run().then(() => {
        colorlog(`{Setup Config}`)
        inquirer.prompt(prompts).then(({devUrl}) => {
          db.put({
            _id: env,
            devUrl: devUrl
          }).then(() => {
            done({
              message: message.SUCCEED_INITIALIZED,
              paddingTop: true
            })
            done({
              message: message.CREATE_NEW_THEME,
              exit: true
            })
          }).catch(dbErrorHandler)
        })
      }).catch(dbErrorHandler)
    }

    // Get environments
    db.get(env)
    .then(() => {
      if (skip) {
        resolve(db)
        return
      }

      db.get(current)
        .then(() => {
          resolve(db)
        })
        .catch(err => {
          if (err.status === status.MISSING) {
            error({
              message: message.ERROR_NO_THEME,
              paddingTop: true
            })
            done({
              message: message.CREATE_NEW_THEME,
              exit: true,
              paddingBottom: true
            })
          } else {
            error({
              message: message.ERROR_NO_THEME,
              padding: true,
              exit: true
            })
          }
        })
    })
    .catch(err => {
      if (err.status === status.MISSING) {
        error({
          message: message.ERROR_PROJECT_FILE_NOT_EXISTS,
          padding: true
        })

        initProject()
      } else {
        dbErrorHandler(err)
      }
    })
  })
}
