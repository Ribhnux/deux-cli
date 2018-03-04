const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const jsonar = require('jsonar')
const arrandel = require('arrandel')
const {dbTypes} = require('./fixtures')
const Init = require('./init')
const message = require('./messages')

const logger = global.deuxhelpers.require('logger')
const {dirlist, filelist} = global.deuxhelpers.require('util/file')
const {isJSON} = global.deuxhelpers.require('util/misc')

class CLI {
  constructor() {
    this.$db = {}
    this.$title = 'Untitled CLI'
    this.$prompts = []
    this.$logger = {}
    this.$init = undefined
    this.$input = undefined
  }

  /**
   * Initializing cli
   */
  init(options = {}, skip = false) {
    if (options.input) {
      const json = isJSON(options.input)
      if (json) {
        options.api = true
        this.$input = json
      } else {
        logger.exit(message.ERROR_INVALID_INPUT, true)
      }
    }

    this.$init = new Init(skip, Object.assign({}, {
      db: options.db,
      api: options.api || this.$input
    }))

    this.$init.check().then(db => {
      this.$logger.versionlog = logger.versionlog
      this.$logger.title = (msg, padding = true) => {
        if (!this.$init.apiMode()) {
          logger.colorlog(msg, padding)
        }
      }

      this.$logger.exit = err => {
        logger.exit(err, this.$init.apiMode())
      }

      this.$logger.finish = msg => {
        logger.finish(msg, this.$init.apiMode())
      }

      this.$logger.happyExit = (msg = message.DONE_NO_REMOVE) => {
        logger.finish(msg, this.$init.apiMode())
      }

      this.$logger.loader = (msg, color = 'cyan') => {
        return logger.loader(msg, color, this.$init.apiMode())
      }

      this.$db = db
      this.prepare()

      const action = () => {
        if (this.$init.apiMode()) {
          this.action(this.$input)
        } else {
          if (this.$prompts.length > 0) {
            if (!this.$init.apiMode()) {
              this.$logger.versionlog()
            }

            this.$logger.title(this.$title)
            inquirer.prompt(this.$prompts).then(answers => {
              this.action(answers)
            }).catch(this.$logger.exit)
          }

          if (!this.$subcmd && this.$prompts.length === 0) {
            if (!this.$init.apiMode()) {
              this.$logger.versionlog()
            }

            this.$logger.title(`\n${this.$title}`, false)
            this.action({})
          }
        }
      }

      if (this.beforeAction) {
        this.beforeAction().then(() => {
          action()
        }).catch(this.$logger.exit)
      } else {
        action()
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
    const config = this.$db[dbTypes.CONFIG]

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
    const themes = Object.assign({}, this.$db[dbTypes.THEMES])

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
      delete this.$db[dbTypes.THEMES][themeName]
      if (this.$db[dbTypes.CURRENT] && this.$db[dbTypes.CURRENT].slug === themeName) {
        this.$db[dbTypes.CURRENT] = {}
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
    delete config.details
    delete config.releases
    delete config.repo

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
    this.$db[dbTypes.THEMES][slug] = info
  }

  /**
   * Get current active theme in project
   */
  getCurrentTheme() {
    return this.$db[dbTypes.THEMES][this.$db[dbTypes.CURRENT].slug]
  }

  /**
   * Get theme from database by slug
   *
   * @param {String} slug
   */
  getThemeBySlug(slug = '') {
    const themes = this.$db[dbTypes.THEMES]

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
    this.$db[dbTypes.CURRENT] = {name, slug, version}
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
   * Synchronize from php config to database.
   */
  sync() {
    const themeDetails = this.themeDetails()
    const slugfn = themeDetails.slugfn
    const configPath = this.currentThemeConfigPath()
    const phpArray = arrandel(configPath)
    const json = jsonar.parse(phpArray[`${slugfn}_config`], {
      emptyRules: {
        asset: {
          libs: {},
          sass: {
            components: [],
            layouts: [],
            pages: [],
            themes: [],
            vendors: []
          },
          fonts: {}
        },
        plugins: {},
        components: [],
        imgsize: {},
        filters: [],
        actions: [],
        libraries: [],
        helpers: [],
        menus: {},
        widgets: {},
        features: {},
        customizer: {
          /* eslint-disable camelcase */
          panels: {},
          sections: {},
          settings: {},
          control_types: {},
          controls: {}
          /* eslint-enable */
        }
      }
    })
    this.setThemeConfig(json, true)
  }

  /**
   * Get message after subcommands cli run.
   *
   * @param {String} data
   * @param {String} defaultMsg
   */
  getMessage(data, defaultMsg) {
    let msg = ''

    if (this.$init.apiMode()) {
      if (isJSON(data.stdout)) {
        msg = JSON.parse(data.stdout)
      } else {
        msg = new Error(message.ERROR_INVALID_API)
      }
    } else {
      msg = new Error(defaultMsg)
    }

    return msg
  }

  /**
   * Global task for release and test
   */
  getTestOptions() {
    let stylelintrc = '.stylelintrc'
    if (!existsSync(this.currentThemePath(stylelintrc))) {
      stylelintrc = this.templateSourcePath(stylelintrc)
    }

    let eslintrc

    if (existsSync(this.themePath('.eslintrc'))) {
      eslintrc = this.currentTheme('.eslintrc')
    } else {
      eslintrc = this.templateSourcePath('.eslintrc')
    }

    const options = {
      wpcs: [this.currentThemePath(), '--excludes=woocommerce', '--skip-warning'],
      themecheck: [this.currentThemePath(), '--skip-warning', '--excludes=releases,.stylelintrc,.editorconfig,.eslintrc,.deuxconfig'],
      w3Validator: [this.getConfig('devUrl')],
      sass: [
        '--config',
        stylelintrc,
        '--config-basedir',
        path.dirname(global.bin.path),
        path.join('assets-src', 'sass', '**'),
        path.join('includes', 'customizer', 'assets-src', 'sass', '**')
      ],
      js: [
        '--no-semicolon',
        path.join('assets-src', 'js', '**'),
        '!', path.join('assets-src', 'js', 'node_modules', '**'),
        path.join('includes', 'customizer', 'assets-src', 'js', '**'),
        '!', path.join('includes', 'customizer', 'assets-src', 'js', 'node_modules', '**'),
        '--extend',
        eslintrc
      ]
    }

    if (this.$init.apiMode()) {
      options.wpcs.push('--json')
      options.themecheck.push('--json')
      options.w3Validator.push('--json')
      options.js.push('--reporter')
      options.js.push('json')
      options.sass.push('--formatter')
      options.sass.push('json')
    }

    return options
  }
}

module.exports = CLI
