const {dbTypes} = require('./const')

const errHandler = err => {
  const error = global.helpers.require('logger/error')
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

exports.getTheme = (db, themeName) => new Promise((resolve, reject) => {
  const message = global.const.require('messages')

  try {
    const themedb = db[dbTypes.THEMES]
    if (themedb[themeName]) {
      resolve(themedb[themeName])
    } else {
      reject(new Error(message.ERROR_NO_THEME_FOUND))
    }
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
  const extend = require('extend')
  const path = require('path')
  const jsonar = require('jsonar')

  const {wpThemeDir} = global.const.require('path')
  const compileFile = global.helpers.require('compiler/single')

  const current = db[dbTypes.CURRENT]
  const theme = extend(true, db[dbTypes.THEMES][current.slug], newConfig)
  const config = Object.assign({}, theme)
  delete config.details

  const phpconfig = jsonar.arrify(config, {
    prettify: true,
    quote: jsonar.quoteTypes.SINGLE,
    trailingComma: true
  })

  compileFile({
    srcPath: path.join(global.templates.path, 'config.php'),
    dstPath: path.join(wpThemeDir, theme.details.slug, `${theme.details.slug}-config.php`),
    syntax: {
      theme: theme.details,
      config: phpconfig
    }
  })

  resolve()
})
