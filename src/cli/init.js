import { existsSync, writeFile, readFileSync } from 'fs'
import * as message from '../lib/messages'
import { wpConfigPath, projectPath } from '../lib/const'
import { isJSON } from '../lib/utils'
import { error, done } from '../lib/logger'

export default options => {
  return new Promise((resolve, reject) => {
    if (!existsSync(wpConfigPath)) {
      throw new Error(message.ERROR_NOT_WP_FOLDER)
    }

    // check if .deuxproject exists
    if (!existsSync(projectPath)) {
      console.log('')
      error({
        err: message.ERROR_PROJECT_FILE_NOT_EXISTS,
        exit: false
      })

      writeFile(projectPath, `{}`, err => {
        if (err) throw new Error(err)
        done(message.INIT_PROJECT)
        done(message.SUCCEED_INITIALIZED)
        done(message.CREATE_NEW_THEME)
        reject()
      })
    } else {
      const json = readFileSync(projectPath, 'ascii')
      const deux = isJSON(json)

      // check if .deuxproject is valid JSON format
      if (!deux) {
        throw new Error(message.ERROR_PROJECT_FILE_INVALID_JSON)
      }

      // check if .deuxproject is not empty / {}
      if (!deux.list && !deux.current) {
        if (options === 'new') {
          resolve()
          return
        }
        console.log('')
        error({
          err: message.ERROR_NO_THEME,
          exit: false
        })
        done(message.CREATE_NEW_THEME)
        reject()
      }
    }

    resolve()
  })
}
