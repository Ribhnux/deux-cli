const path = require('path')
const inquirer = require('inquirer')
const jsonar = require('jsonar')
const arrandel = require('arrandel')
const {dbTypes} = require('./fixtures')
const Init = require('./init')

const {colorlog, exit} = global.deuxhelpers.require('logger')
const {dirlist, filelist} = global.deuxhelpers.require('util/file')

class CLI {
  constructor() {
    this.db = {}
    this.title = 'Untitled CLI'
    this.prompts = []
  }

  /**
   * Initializing cli
   */
  init(skip = false) {
    const init = new Init(skip)
    init.check().then(db => {
      this.db = db
      this.prepare()

      if (this.prompts.length > 0) {
        colorlog(this.title)
        this.beforeInit()
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
   * Setup everything before init
   */
  beforeInit() {}

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
   * @param {String} themeName
   */
  getThemes(themeName = '') {
    const themes = Object.assign({}, this.db[dbTypes.THEMES])

    if (themeName === '') {
      return themes
    }

    if (!(themeName in themes)) {
      return undefined
    }

    return themes[themeName]
  }

  /**
   * Remove theme from database
   * @param {String} themeName
   */
  removeTheme(themeName = '') {
    if (themeName !== '' && this.getThemes(themeName)) {
      delete this.db[dbTypes.THEMES][themeName]
      if (this.db[dbTypes.CURRENT] && this.db[dbTypes.CURRENT].slug === themeName) {
        this.db[dbTypes.CURRENT] = {}
      }
    }
  }

  /**
   * Alias of getCurrentTheme
   *
   * @param {String} key
   */
  themeInfo(key = '') {
    const currentTheme = Object.assign({}, this.getCurrentTheme())

    if (key !== '' && key in currentTheme) {
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
   * @param {Boolean} sync Used to save synchronize mode
   */
  setThemeConfig(newConfig = {}, sync = false) {
    const extend = require('extend')
    const jsonar = require('jsonar')

    const compileFile = global.deuxhelpers.require('compiler/single')

    const themeInfo = extend(this.getCurrentTheme(), newConfig)
    const themeDetails = this.themeDetails()
    const config = Object.assign({}, themeInfo)

    delete config.asset.sass
    delete config.pageTemplates
    delete config.partialTemplates
    delete config.details

    if (sync === false) {
      const phpconfig = jsonar.arrify(config, {
        prettify: true,
        quote: jsonar.quoteTypes.SINGLE,
        trailingComma: true
      })

      compileFile({
        srcPath: this.templateSourcePath('config.php'),
        dstPath: this.currentThemeConfigPath(),
        syntax: {
          theme: themeDetails,
          config: phpconfig
        }
      })
    }
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
   * Get current theme path
   * @param {String} paths
   */
  currentThemePath(...paths) {
    return this.themePath([this.themeDetails('slug')].concat(...paths))
  }

  /**
   * Get current theme config path
   * reusable function
   *
   * @return string
   */
  currentThemeConfigPath() {
    const slug = this.themeDetails('slug')
    return this.currentThemePath(`${slug}-config.php`)
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
  templateSourcePath(...paths) {
    let templatePath = [global.deuxtpl.path]

    if (paths.length > 0) {
      templatePath = templatePath.concat(...paths)
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

  /**
   * Synchronize from php config to database
   */
  sync() {
    const themeDetails = this.themeDetails()
    const slugfn = themeDetails.slugfn
    const configPath = this.currentThemeConfigPath()
    const phpArray = arrandel(configPath)
    const json = jsonar.parse(phpArray[`${slugfn}_config`], true)
    this.setThemeConfig(json, true)
  }
}

module.exports = CLI
