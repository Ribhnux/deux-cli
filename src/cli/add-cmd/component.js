import path from 'path'
import {existsSync} from 'fs'
import inquirer from 'inquirer'
import faker from 'faker'
import _s from 'string'
import validator from '../lib/validator'
import {error, done, colorlog} from '../lib/logger'
import {templateDir, wpThemeDir} from '../lib/const'
import {compileFile} from '../lib/utils'
import {dbErrorHandler, getCurrentTheme, saveConfig} from '../lib/db-utils'
import * as message from '../lib/messages'

export default db => {
  colorlog('Add a {New Component}')
  const prompts = [
    {
      name: 'componentName',
      message: 'Name',
      default: 'New Component',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'componentDesc',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]
  inquirer.prompt(prompts).then(answers => {
    getCurrentTheme(db).then(result => {
      const {docId, textDomain, themeName, version} = result
      const {componentName, componentDesc} = answers
      const componentSlug = _s(componentName).slugify().s
      const themePath = path.join(wpThemeDir, textDomain)
      const componentPath = path.join(themePath, 'components', `${componentSlug}.php`)

      if (existsSync(componentPath)) {
        error({
          message: message.ERROR_COMPONENT_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      const themeFnPrefix = _s(themeName).underscore().s
      const componentFn = _s(componentName).underscore().s
      const syntax = {
        version,
        themeName,
        themeFnPrefix,
        componentName,
        componentDesc,
        componentFn
      }

      db.upsert(docId, doc => {
        doc.components.push(componentSlug)
        compileFile({
          srcPath: path.join(templateDir, '_partials', 'component.php'),
          dstPath: componentPath,
          syntax
        })
        return doc
      }).then(() => {
        saveConfig(db, docId).then(() => {
          done({
            message: message.SUCCEED_COMPONENT_ADDED,
            paddingTop: true,
            exit: true
          })
        })
      }).catch(dbErrorHandler)
    })
  })
}
