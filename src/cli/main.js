const path = require('path')
const inquirer = require('inquirer')
const {dbTypes} = require('./fixtures')
const Init = require('./init')

const {colorlog, exit} = global.deuxhelpers.require('logger')
const {dirlist} = global.deuxhelpers.require('util/file')

const init = new Init()

class CLI {
  constructor() {
    this.db = {}
    this.title = 'Untitled CLI'
    this.prompts = []
    this.skipInit = false
  }

  init() {
    this.prepare()
    init.skip = this.skipInit
    init.check().then(db => {
      this.db = db

      if (this.prompts.length > 0) {
        colorlog(this.title)
        inquirer.prompt(this.prompts).then(this.action).catch(exit)
      }
    })
  }

  /**
   * Setup everything before init
   */
  prepare() {}

  /**
   * Action after prompts filled
   *
   * @param {Function} callback
   */
  action(callback) {
    return callback
  }

  /**
   * Get config from database
   *
   * @param {String} key
   */
  getConfig(key = '') {
    if (!(key in this.db[dbTypes.CONFIG])) {
      return undefined
    }

    return this.db[dbTypes.CONFIG][key]
  }

  /**
   * Get theme path
   *
   * @param {String} themeName
   */
  themePath(themeName = null, stylePath = false) {
    let wpThemePath = [this.getConfig('wpPath'), 'wp-content', 'themes']

    if (themeName) {
      wpThemePath = wpThemePath.concat(themeName)
    }

    if (stylePath) {
      wpThemePath = wpThemePath.concat('style.css')
    }

    return path.join(...wpThemePath)
  }

  /**
   * Get theme list from wp-content/themes/
   */
  themeList(stylePath = false) {
    return dirlist(this.themePath()).map(item => this.themePath(item, stylePath))
  }

  /**
   * Add theme to database
   *
   * @param {String} slug
   * @param {Object} info
   */
  addTheme(slug, info) {
    this.db[dbTypes.THEMES][slug] = info
  }

  /**
   * Set active theme in project
   *
   * @param {Object} object
   */
  setCurrentTheme({name, slug, version}) {
    this.db[dbTypes.CURRENT] = {name, slug, version}
  }

  /**
   * Save current theme config
   *
   * @param {Object} newConfig
   */
  saveConfig(newConfig = {}) {
    const extend = require('extend')
    const path = require('path')
    const jsonar = require('jsonar')

    const {wpThemeDir} = global.const.require('path')
    const compileFile = global.helpers.require('compiler/single')

    const current = this.db[dbTypes.CURRENT]
    const theme = extend(this.db[dbTypes.THEMES][current.slug], newConfig)
    const config = Object.assign({}, theme)

    delete config.pageTemplates
    delete config.partialTemplates
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
  }
}

module.exports = CLI
