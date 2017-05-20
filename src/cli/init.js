import {existsSync} from 'fs'
import PouchDB from 'pouchdb'
import dbUpsert from 'pouchdb-upsert'
import dbFind from 'pouchdb-find'
import * as message from '../lib/messages'
import {wpConfigPath, dbPath, status} from '../lib/const'
import {error, done} from '../lib/logger'

// PouchDB: Config
// PouchDB.debug.enable('pouchdb:find')

// PouchDB: Plugins
PouchDB.plugin(dbUpsert)
PouchDB.plugin(dbFind)

export default skip => {
  return new Promise(resolve => {
    if (!existsSync(wpConfigPath)) {
      throw new Error(message.ERROR_NOT_WP_FOLDER)
    }

    const env = 'deux.env'
    const current = 'deux.current'
    const db = new PouchDB(dbPath)

    const initProject = () => {
      db.put({
        _id: env,
        php: '',
        devUrl: ''
      }).then(() => {
        done({
          message: message.SUCCEED_INITIALIZED
        })
        done({
          message: message.CREATE_NEW_THEME,
          paddingBottom: true,
          exit: true
        })
      }).catch(err => {
        error({
          message: err.message,
          padding: true,
          exit: true
        })
      })
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
          paddingTop: true
        })

        error({
          message: message.INIT_PROJECT
        })

        initProject()
      } else {
        error({
          message: err.message,
          padding: true,
          exit: true
        })
      }
    })
  })
}
