import {existsSync, writeFileSync, readFileSync} from 'fs'
import * as message from '../lib/messages'
import {wpConfigPath, projectPath} from '../lib/const'
import {isJSON} from '../lib/utils'
import {error, done} from '../lib/logger'

export default options => {
  return new Promise(resolve => {
    if (!existsSync(wpConfigPath)) {
      throw new Error(message.ERROR_NOT_WP_FOLDER)
    }

    // Check if .deuxproject exists
    if (existsSync(projectPath) === false) {
      error({
        message: message.ERROR_PROJECT_FILE_NOT_EXISTS,
        paddingTop: true
      })

      writeFileSync(projectPath, JSON.stringify({
        list: {},
        current: '',
        env: {}
      }))

      error({
        message: message.INIT_PROJECT
      })
      done({
        message: message.SUCCEED_INITIALIZED
      })
      done({
        message: message.CREATE_NEW_THEME,
        paddingBottom: true,
        exit: true
      })
    } else {
      const json = readFileSync(projectPath, 'ascii')
      const deux = isJSON(json)

      // Check if .deuxproject is valid JSON format
      if (!deux) {
        error({
          message: message.ERROR_PROJECT_FILE_INVALID_JSON,
          padding: true,
          exit: true
        })
      }

      // Check if .deuxproject is not empty / {}
      if (deux.current === '') {
        if (options === 'new') {
          resolve()
          return
        }

        error({
          message: message.ERROR_NO_THEME,
          paddingTop: true
        })
        done({
          message: message.CREATE_NEW_THEME,
          exit: true,
          paddingBottom: true
        })
      }
    }

    resolve()
  })
}
