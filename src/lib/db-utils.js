import path from 'path'
import jsonar from 'jsonar'
import _s from 'string'
import {compileFile} from './utils'
import {wpThemeDir, templateDir} from './const'
import {error} from './logger'

export const dbErrorHandler = err => {
  error({
    message: err.message,
    padding: true,
    exit: true
  })
}

export const setCurrentTheme = (db, {themeName, textDomain, version}) => new Promise((resolve, reject) => {
  const docId = `theme.${textDomain}`

  db.upsert('deux.current', doc => {
    return Object.assign(doc, {
      docId,
      themeName,
      version
    })
  }).then(() => {
    resolve()
  }).catch(err => {
    reject(err)
  })
})

export const getCurrentTheme = db => new Promise(resolve => {
  db.get('deux.current').then(({docId}) => {
    db.get(docId).then(result => {
      resolve(Object.assign(result, {docId}))
    }).catch(dbErrorHandler)
  }).catch(dbErrorHandler)
})

export const saveConfig = (db, docId) => new Promise(resolve => {
  db.get(docId).then(doc => {
    const {themeName, textDomain, version} = doc

    delete doc._id
    delete doc._rev
    delete doc.themeName
    delete doc.textDomain
    delete doc.repoUrl

    const themeConfig = jsonar(doc, true)
    const themeFnPrefix = _s(themeName).underscore()

    compileFile({
      srcPath: path.join(templateDir, 'config.php'),
      dstPath: path.join(wpThemeDir, textDomain, 'config.php'),
      syntax: {
        version,
        themeConfig,
        themeFnPrefix
      }
    })
    resolve()
  }).catch(dbErrorHandler)
})

export default {}
