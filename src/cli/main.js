const path = require('path')
const inquirer = require('inquirer')
const {dbTypes} = require('./fixtures')
const Init = require('./init')

const {colorlog, exit} = global.deuxhelpers.require('logger')
const {dirlist, filelist} = global.deuxhelpers.require('util/file')

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
        inquirer.prompt(this.prompts).then(answers => {
          this.action(answers)
        }).catch(exit)
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
   * Alias of getCurrentTheme
   */
  themeInfo() {
    return this.getCurrentTheme()
  }

  /**
   * Get theme details
   *
   * @param {String} key
   */
  themeDetails(key = '') {
    const currentTheme = this.getCurrentTheme()

    if (key !== '') {
      return currentTheme.details[key]
    }

    return currentTheme.details
  }

  /**
   * Save current theme config
   *
   * @param {Object} newConfig
   */
  setThemeConfig(newConfig = {}) {
    const extend = require('extend')
    const path = require('path')
    const jsonar = require('jsonar')

    const compileFile = global.deuxhelpers.require('compiler/single')

    const themeInfo = extend(this.themeInfo(), newConfig)
    const themeDetails = this.themeDetails()
    const config = Object.assign({}, themeInfo)

    delete config.pageTemplates
    delete config.partialTemplates
    delete config.details

    const phpconfig = jsonar.arrify(config, {
      prettify: true,
      quote: jsonar.quoteTypes.SINGLE,
      trailingComma: true
    })

    compileFile({
      srcPath: path.join(global.deuxtpl.path, 'config.php'),
      dstPath: path.join(this.themePath(themeDetails.slug), `${themeDetails.slug}-config.php`),
      syntax: {
        theme: themeDetails,
        config: phpconfig
      }
    })
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
   * Get current active theme in project
   */
  getCurrentTheme() {
    return this.db[dbTypes.THEMES][this.db[dbTypes.CURRENT].slug]
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
   * Get template source index list
   *
   * @param {String} dir
   */
  templateSourceList(dir = '') {
    let list = [global.deuxtpl.path]

    if (dir !== '') {
      list = list.concat(dir)
    }

    return filelist(path.join(...list))
  }
}

module.exports = CLI
