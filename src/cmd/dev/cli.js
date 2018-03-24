const path = require('path')
const {existsSync, readFileSync} = require('fs')
const gulp = require('gulp')
const browserSync = require('browser-sync')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const merge = require('merge2')
const clone = require('gulp-clone')
const sourceMaps = require('gulp-sourcemaps')
const rtlcss = require('gulp-rtlcss')
const cleanCSS = require('gulp-clean-css')
const rollup = require('rollup-stream')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const babel = require('rollup-plugin-babel')
const rollupCleanup = require('rollup-plugin-cleanup')
const autoPrefixr = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const wpPot = require('gulp-wp-pot')
const gettext = require('gulp-gettext')
const replacer = require('gulp-replace')
const cssbeautify = require('gulp-cssbeautify')
const stripComments = require('gulp-strip-css-comments')
const gulpif = require('gulp-if')
const slugify = require('node-slugify')
const watch = require('gulp-watch')
let defaultConfig = require('./config')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')

class DevCLI extends CLI {
  constructor(options) {
    super()
    this.$options = options
    this.$buildTask = []
    this.init(options)
  }

  /**
   * Setup gulp task
   */
  prepare() {
    this.$title = this.$options.build === true ? 'Build {asset files}' : 'Start {Development} Mode'

    // Source Path
    this.srcPath = {
      ASSET_SASS: this.currentThemePath('assets-src', 'sass'),
      ASSET_JS: this.currentThemePath('assets-src', 'js'),
      CUSTOMIZER_ASSET_SASS: this.currentThemePath('includes', 'customizer', 'assets-src', 'sass'),
      CUSTOMIZER_ASSET_JS: this.currentThemePath('includes', 'customizer', 'assets-src', 'js')
    }

    // Destination Path
    this.dstPath = {
      ASSET_CSS: this.currentThemePath('assets', 'css'),
      ASSET_JS: this.currentThemePath('assets', 'js'),
      CUSTOMIZER_ASSET_CSS: this.currentThemePath('includes', 'customizer', 'assets', 'css'),
      CUSTOMIZER_ASSET_JS: this.currentThemePath('includes', 'customizer', 'assets', 'js')
    }

    const configFile = this.currentThemePath('.deuxconfig')
    if (existsSync(configFile)) {
      try {
        defaultConfig = JSON.parse(readFileSync(configFile))
        if (!defaultConfig.build) {
          defaultConfig.build = {}
        }
      } catch (err) {
        this.$logger.exit(err)
      }
    }

    // Build translation.
    defaultConfig.build.translation = [
      {
        fn: this.compilePot,
        watch: [
          '**/*.php',
          '*.php'
        ]
      }
    ]

    for (const key in defaultConfig.build) {
      if (Object.prototype.hasOwnProperty.call(defaultConfig.build, key)) {
        defaultConfig.build[key].forEach(item => {
          const suffix = item.filename ? `:${slugify(item.filename)}` : ''
          const taskName = `build:${key}${suffix}`
          let compiler = this.sassCompiler
          let srcPath = this.srcPath.ASSET_SASS
          let dstPath = this.dstPath.ASSET_CSS

          if (key.includes(':js')) {
            compiler = this.jsCompiler
            srcPath = this.srcPath.ASSET_JS
            dstPath = this.dstPath.ASSET_JS
          }

          if (key.includes('customizer:style')) {
            srcPath = this.srcPath.CUSTOMIZER_ASSET_SASS
            dstPath = this.dstPath.CUSTOMIZER_ASSET_CSS
          }

          if (key.includes('customizer:js')) {
            srcPath = this.srcPath.CUSTOMIZER_ASSET_JS
            dstPath = this.dstPath.CUSTOMIZER_ASSET_JS
          }

          if (typeof item.fn === 'function') {
            gulp.task(taskName, () => {
              item.fn.apply(this)
            })
          } else {
            gulp.task(taskName, compiler(item.filename, {
              sourcemap: item.sourcemap,
              rtl: item.rtl,
              srcPath,
              dstPath
            }))
          }

          let watchPath = item.watch || []
          watchPath = watchPath.map(glob => {
            if (glob[0] === '!') {
              glob = glob.substr(1, glob.length)
              return `!${this.currentThemePath(...glob.split('/'))}`
            }

            return this.currentThemePath(...glob.split('/'))
          })

          if (item.filename) {
            watchPath = [path.join(srcPath, item.filename)].concat(watchPath)
          }

          this.$buildTask.push({
            taskName,
            watchPath
          })
        })
      }
    }

    // Files watcher
    gulp.task('watch:files', () => {
      this.$buildTask.filter(item => item.watchPath.length > 0).forEach(item => {
        watch(item.watchPath, () => {
          gulp.start(item.taskName)
        })
      })
    })
  }

  /**
   * Start gulp
   */
  action() {
    if (this.$options.build === true) {
      const loader = this.$logger.loader(messages.SUCCEED_BUILD_ASSET)
      this.buildAsset()
      loader.succeed(messages.SUCCEED_BUILD_ASSET)
    } else {
      const watchFileList = [
        ['**', '*.php'],
        ['**', '*.css'],
        ['**', '*.js']
      ].map(item => this.currentThemePath(item))

      const startServer = new Promise(resolve => {
        browserSync.init(watchFileList, {
          proxy: this.getConfig('devUrl'),
          logLevel: 'info',
          logPrefix: this.themeDetails('slug'),
          open: false,
          notify: false
        }, () => resolve())
      })

      // Compile all before watching files.
      startServer.then(() => {
        this.buildAsset()
      }).then(() => {
        gulp.start(['watch:files'])
      }).catch(this.$logger.exit)
    }
  }

  /**
   * Build assets, translation and syncrhonize config.
   */
  buildAsset() {
    const task = []

    this.$buildTask.forEach(item => {
      task.push(item.taskName)
    })

    gulp.start(task)
  }

  /**
   * SASS Compiler
   *
   * @param {String} inputFile
   * @param {Object} options
   */
  sassCompiler(inputFile, options) {
    return () => {
      // Compile Default Style
      const defaultStyle = gulp.src(path.join(options.srcPath, inputFile))
        .pipe(plumber())
        .pipe(replacer(/\/\*rtl(.[^/]*)\*\//g, '/*!rtl$1*/'))
        .pipe(replacer(/\/\*!rtl(.[^/]*)\*\/;/g, ';/*!rtl:after$1*/'))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoPrefixr({
          browsers: ['last 2 versions', 'Firefox < 20'],
          cascade: true
        }))

      // Compile RTL only when options.rtl is given
      let RTLStyle
      let RTLMinStyle

      if (options.rtl === true) {
        // Compile RTL Style
        RTLStyle = defaultStyle.pipe(clone())
          .pipe(replacer(/\/\*!rtl(.[^/]*)\*\//g, '/*rtl$1*/'))
          .pipe(replacer(/;\/\*rtl:after(.[^/]*)\*\//g, '/*rtl$1*/;'))
          .pipe(rtlcss())
          .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
          .pipe(replacer(/}\/\*!/g, '}\n\n/*!'))
          .pipe(replacer(/\*\//g, '*/\n'))
          .pipe(rename({suffix: '-rtl'}))
          .pipe(gulp.dest(options.dstPath))

        // Compile RTL Minified Style
        RTLMinStyle = RTLStyle.pipe(clone())
          .pipe(cleanCSS({compatibility: 'ie8'}))
          .pipe(stripComments({preserve: false}))
          .pipe(gulpif(options.sourcemap === true, sourceMaps.init()))
          .pipe(rename({basename: path.parse(inputFile).name, suffix: '.min-rtl'}))
          .pipe(gulpif(options.sourcemap === true, sourceMaps.write('./')))
          .pipe(gulp.dest(options.dstPath))
      }

      const style = defaultStyle
        .pipe(replacer(/\/\*rtl(.[^/]*)\*\//g, ''))
        .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
        .pipe(replacer(/}\/\*!/g, '}\n\n/*!'))
        .pipe(replacer(/\*\//g, '*/\n'))
        .pipe(gulp.dest(options.dstPath))

      // Compile Minified Style
      const minStyle = style.pipe(clone())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulpif(options.sourcemap === true, sourceMaps.init()))
        .pipe(rename({suffix: '.min'}))
        .pipe(stripComments({preserve: false}))
        .pipe(gulpif(options.sourcemap === true, sourceMaps.write('./')))
        .pipe(gulp.dest(options.dstPath))

      return merge([style, minStyle], options.rtl === true ? [RTLStyle, RTLMinStyle] : [])
    }
  }

  /**
   * Javascript Compiler
   *
   * @param {String} inputFile
   * @param {Object} options
   */
  jsCompiler(inputFile, options) {
    return () => {
      const script = plumber()
      .pipe(rollup({
        input: path.join(options.srcPath, inputFile),
        sourcemap: false,
        format: 'iife',
        plugins: [
          babel({
            presets: [
              [require.resolve('babel-preset-env'), {modules: false}]
            ],
            babelrc: false
          }),
          rollupCleanup()
        ]
      }))
      // Beautify
      .pipe(source(inputFile, options.srcPath))
      .pipe(buffer())
      .pipe(gulp.dest(options.dstPath))

      // Minify
      const minScript = script.pipe(clone())
        .pipe(gulpif(options.sourcemap === true, sourceMaps.init()))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulpif(options.sourcemap === true, sourceMaps.write('./')))
        .pipe(gulp.dest(options.dstPath))

      return merge([script, minScript])
    }
  }

  /**
   * Auto compile translation for all php source in theme
   */
  compilePot() {
    const themeDetails = this.themeDetails()
    const potFilePath = this.currentThemePath('languages', `${themeDetails.slug}.pot`)

    const compilePotFile = gulp
      .src(this.currentThemePath('*.php'))
      .pipe(plumber())
      .pipe(wpPot({
        domain: themeDetails.slug,
        package: themeDetails.name,
        relativeTo: this.currentThemePath()
      }))
      .pipe(gulp.dest(potFilePath))

    const compilePotToMo = gulp.src(potFilePath)
      .pipe(gettext())
      .pipe(rename({base: 'en_EN'}))
      .pipe(gulp.dest(this.currentThemePath('languages')))

    return merge(compilePotFile, compilePotToMo)
  }
}

module.exports = DevCLI
