import inquirer from 'inquirer'
import * as message from '../lib/messages'
import {error, done, colorlog} from '../lib/logger'
import {setCurrentTheme, dbErrorHandler} from '../lib/db-utils'

const displayPrompt = db => {
  colorlog(`Switch to another {project}`)
  const prompts = [
    {
      type: 'list',
      name: 'themelist',
      message: 'Select project',
      choices: () => new Promise(resolve => {
        db.find({
          selector: {_id: {$regex: 'theme.*'}},
          fields: ['_id', 'themeName', 'textDomain', 'version']
        }).then(result => {
          const choices = result.docs.map(value => {
            const {themeName, version} = value
            const name = `${themeName} v${version}`
            return {name, value}
          })

          resolve(choices)
        }).catch(dbErrorHandler)
      })
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    }
  ]

  inquirer.prompt(prompts).then(answers => {
    if (answers.confirm) {
      db.get('deux.current').then(result => {
        const {_id: docId, themeName, textDomain, version} = answers.themelist
        if (result.docId === docId) {
          done({
            message: message.SUCCEED_ALREADY_IN_CURRENT_PROJECT,
            paddingTop: true,
            exit: true
          })
        }

        setCurrentTheme(db, {
          themeName,
          textDomain,
          version
        }).then(() => {
          done({
            message: message.SUCCEED_THEME_SWITCHED,
            paddingTop: true,
            exit: true
          })
        }).catch(dbErrorHandler)
      }).catch(dbErrorHandler)
    }
  })
}

const setDirectly = (db, textDomain) => {
  const docId = `theme.${textDomain}`

  db.get('deux.current').then(result => {
    if (result.docId === docId) {
      done({
        message: message.SUCCEED_ALREADY_IN_CURRENT_PROJECT,
        paddingTop: true,
        exit: true
      })
    }

    db.find({
      selector: {_id: {$eq: docId}},
      fields: ['themeName', 'version']
    }).then(result => {
      if (result.docs.length === 0) {
        error({
          message: message.ERROR_NO_THEME_FOUND,
          paddingTop: true,
          exit: true
        })
      }

      const {themeName, version} = result.docs
      setCurrentTheme(db, {
        themeName,
        textDomain,
        version
      }).then(() => {
        done({
          message: message.SUCCEED_THEME_SWITCHED,
          paddingTop: true,
          exit: true
        })
      }).catch(dbErrorHandler)
    }).catch(dbErrorHandler)
  }).catch(dbErrorHandler)
}

export default (db, args) => {
  switch (args.length) {
    case 0:
      displayPrompt(db)
      break

    case 1:
      setDirectly(db, args[0])
      break

    default:
      error({
        message: message.ERROR_INVALID_COMMAND,
        exit: true,
        paddingTop: true
      })
      break
  }
}
