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

  /**
   * Initializing cli
   */
  init() {
    init.skip = this.skipInit
    init.check().then(db => {
      this.db = db
      this.prepare()

      if (this.prompts.length > 0) {
        colorlog(this.title)
        inquirer.prompt(this.prompts).then(answers => {
          this.action(answers)
        }).catch(exit)
      }

      if (!this.subcmd && this.prompts.length === 0) {
        colorlog(this.title)
        this.action({})
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
    const config = this.db[dbTypes.CONFIG]

    if (key === '') {
      return config
    }

    if (!(key in config)) {
      return undefined
    }

    return config[key]
  }

  /**
   * Get theme list from database
   *
   * @param {String} key
   */
  getThemes(key = '') {
    const themes = this.db[dbTypes.THEMES]

    if (key === '') {
      return themes
    }

    if (!(key in themes)) {
      return undefined
    }

    return themes[key]
  }

  /**
   * Alias of getCurrentTheme
   *
   * @param {String} key
   */
  themeInfo(key = '') {
    const currentTheme = Object.assign({}, this.getCurrentTheme())

    if (key !== '') {
      return currentTheme[key]
    }

    return currentTheme
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
    const jsonar = require('jsonar')

    const compileFile = global.deuxhelpers.require('compiler/single')

    const themeInfo = extend(this.getCurrentTheme(), newConfig)
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
      srcPath: this.templateSourcePath('config.php'),
      dstPath: this.themePath([themeDetails.slug, `${themeDetails.slug}-config.php`]),
      syntax: {
        theme: themeDetails,
        config: phpconfig
      }
    })
  }

  /**
   * Get theme path
   *
   * @param {String|Array} newPath
   * @param {Boolean} stylePath
   */
  themePath(newPath = null, stylePath = false) {
    let wpThemePath = [this.getConfig('wpPath'), 'wp-content', 'themes']

    if (newPath) {
      wpThemePath = wpThemePath.concat(newPath)
    }

    if (stylePath) {
      wpThemePath = wpThemePath.concat('style.css')
    }

    return path.join(...wpThemePath)
  }

  /**
   * Get theme list from wp-content/themes/
   */
  themeList() {
    return dirlist(this.themePath([]))
  }

  /**
   * Get theme list path from wp-content/themes/
   */
  themeListPath(stylePath = false) {
    return this.themeList().map(item => this.themePath(item, stylePath))
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
   * Get theme from database by slug
   *
   * @param {String} slug
   */
  getThemeBySlug(slug = '') {
    const themes = this.db[dbTypes.THEMES]

    if (!(slug in themes)) {
      return undefined
    }

    return themes[slug]
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
   * Get template path
   *
   * @param {String|Array} sourcePath
   */
  templateSourcePath(sourcePath = null) {
    let templatePath = [global.deuxtpl.path]

    if (sourcePath) {
      templatePath = templatePath.concat(sourcePath)
    }

    return path.join(...templatePath)
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
