const path = require('path')
const jsonar = require('jsonar')
const merge = require('lodash.merge')
const {dbTypes} = require('./const')

const error = global.helpers.require('logger/error')
const compileFile = global.helpers.require('compiler/single')
const {wpThemeDir} = global.const.require('path')

const errHandler = err => {
  error({
    message: err.message,
    padding: true,
    exit: true
  })
}

exports.dbErrorHandler = errHandler

exports.setCurrentTheme = (db, info) => new Promise((resolve, reject) => {
  try {
    db[dbTypes.CURRENT] = info
    resolve(db)
  } catch (err) {
    reject(err)
  }
})

exports.getCurrentTheme = db => new Promise((resolve, reject) => {
  try {
    const current = db[dbTypes.CURRENT]
    const theme = Object.assign({}, db[dbTypes.THEMES][current.slug])

    resolve(theme)
  } catch (err) {
    reject(err)
  }
})

exports.getEnv = db => db[dbTypes.ENVIRONMENT]

exports.saveConfig = (db, newConfig = {}) => new Promise(resolve => {
  const current = db[dbTypes.CURRENT]
  const theme = merge(db[dbTypes.THEMES][current.slug], newConfig)
  const config = Object.assign({}, theme)
  delete config.details

  const phpconfig = jsonar(config, true)

  compileFile({
    srcPath: path.join(global.templates.path, 'config.php'),
    dstPath: path.join(wpThemeDir, theme.details.slug, `${theme.details.slugfn}_config.php`),
    syntax: {
      theme: theme.details,
      config: phpconfig
    }
  })

  resolve()
})
