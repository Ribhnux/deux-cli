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

export default {}
