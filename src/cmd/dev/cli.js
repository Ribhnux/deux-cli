const {existsSync} = require('fs')
const gulp = require('gulp')
const browserSync = require('browser-sync')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const srcmap = require('gulp-sourcemaps')
const cssbeautify = require('gulp-cssbeautify')
const stripComments = require('gulp-strip-css-comments')
const merge = require('merge2')
const clone = require('gulp-clone')
const replacer = require('gulp-replace')
const rtlcss = require('gulp-rtlcss')
const wpPot = require('gulp-wp-pot')
const gettext = require('gulp-gettext')
const extend = require('extend')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')

const CLI = global.deuxcli.require('main')
const error = global.deuxhelpers.require('logger/error')

class DevCLI extends CLI {
  constructor() {
    super()
    this.task = undefined
    this.init()
  }

  /**
   * Setup gulp task
   */
  prepare() {
    this.title = 'Start {development} mode'
    this.tasklist = [
      'build:style',
      'build:editor-style',
      'build:js',
      'build:translation',
      'sync:config',
      'start:server'
    ]

    const themeDetails = this.themeDetails()

    /**
     * Start browser-sync server
     */
    gulp.task('start:server', () => {
      const watchFileList = [
        ['**', '*.php'],
        ['**', '*.css'],
        ['**', '*.js']
      ].map(
        item => this.currentThemePath(item)
      )

      browserSync.init(watchFileList, {
        proxy: this.getConfig('devUrl'),
        logLevel: 'info',
        logPrefix: themeDetails.slug,
        open: false,
        notify: false
      })

      // After add task to gulp
      // Run some startup script directly
      this.compileMainStyle()
      this.compileEditorStyle()
      this.compilePot()
    })

    // Main stylesheet compiler
    gulp.task('build:style', () => {
      return watch([
        this.currentThemePath('assets-src', 'sass', '**', '*.scss'),
        this.currentThemePath('assets-src', 'sass', 'main.scss')
      ], () => {
        this.compileMainStyle()
      })
    })

    // Editor stylesheet compiler
    gulp.task('build:editor-style', () => {
      return watch([
        this.currentThemePath('assets-src', 'sass', 'editor-style.scss')
      ], () => {
        this.compileEditorStyle()
      })
    })

    // Javascript bundler
    gulp.task('build:js', () => {
      return watch([
        this.currentThemePath('assets-src', 'js', 'main.js')
      ], () => {
        this.compileJS()
      })
    })

    // Watch theme-config.php
    gulp.task('sync:config', () => {
      return watch([
        this.currentThemeConfigPath()
      ], () => {
        this.sync()
      })
    })

    // Auto compile pot file
    gulp.task('build:translation', () => {
      return watch([
        this.currentThemePath('**', '*.php'),
        this.currentThemePath('*.php')
      ], () => {
        this.compilePot()
      })
    })
  }

  /**
   * Start gulp
   */
  action() {
    gulp.start.apply(gulp, this.tasklist)
  }

  /**
   *
   */
  sassCompiler(options) {
    const rtlRegx = /;\/\*!rtl(.[^/]*)\*\//g
    const destPath = this.currentThemePath('assets', 'css')

    const gulpPlumber = plumber({
      errorHandler(err) {
        error({
          message: err.message,
          padding: true
        })
        this.emit('end')
      }
    })

    options = extend({
      source: undefined,
      basename: 'main',
      rtl: false,
      beautify: true
    }, options)

    const {
      source,
      basename,
      rtl,
      beautify
    } = options

    if (!source) {
      throw new Error('No source defined.')
    }

    let output = source
      .pipe(gulpPlumber)
      .pipe(sass({
        outputStyle: 'compressed'
      }))
      .pipe(clone())
      .pipe(replacer(rtlRegx, rtl ? '/*rtl$1*/;' : ';'))

    if (rtl) {
      output = output.pipe(rtlcss())
    }

    if (beautify) {
      output = output
        .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
        .pipe(replacer(/}\/\*!/g, '}\n\n/*!'))
        .pipe(replacer(/\*\//g, '*/\n'))
    } else {
      output = output
        .pipe(stripComments({preserve: false}))
        .pipe(srcmap.init({
          loadMaps: true
        }))
        .pipe(stripComments({preserve: false}))
    }

    output = output.pipe(rename({basename}))

    if (beautify === false) {
      output = output
        .pipe(srcmap.write('./'))
    }

    return output.pipe(gulp.dest(destPath))
  }

  /**
   * Compile main.css
   */
  compileMainStyle() {
    const mainCSS = gulp.src(this.currentThemePath('assets-src', 'sass', 'main.scss'))

    // Compile main.css
    const style = this.sassCompiler({
      source: mainCSS
    })

    // Compile RTL Stylesheet main-rtl.css
    const rtlStyle = this.sassCompiler({
      source: mainCSS,
      basename: 'main-rtl',
      rtl: true
    })

    // Compile main.min.css
    const minStyle = this.sassCompiler({
      source: mainCSS,
      basename: 'main.min',
      beautify: false
    })

    // Compile RTL Stylesheet minified main.min-rtl.css
    const rtlMinStyle = this.sassCompiler({
      source: mainCSS,
      basename: 'main.min-rtl',
      rtl: true,
      beautify: false
    })

    return merge([
      style,
      rtlStyle,
      minStyle,
      rtlMinStyle
    ])
  }

  /**
   * Compile editor-style.css
   */
  compileEditorStyle() {
    const editorCSS = gulp.src(this.currentThemePath('assets-src', 'sass', 'editor-style.scss'))
    return this.sassCompiler({
      source: editorCSS,
      basename: 'editor-style',
      rtl: false
    })
  }

  /**
   * Auto compile translation for all php source in theme
   */
  compilePot() {
    const themeDetails = this.themeDetails()
    const potFilePath = this.currentThemePath('languages', `${themeDetails.slug}.pot`)

    const compilePotFile = gulp
      .src(this.currentThemePath('*.php'))
      .pipe(wpPot({
        domain: themeDetails.slug,
        package: themeDetails.name,
        relativeTo: this.currentThemePath()
      }))
      .pipe(gulp.dest(potFilePath))

    const compilePotToMo = gulp.src(potFilePath)
      .pipe(gettext())
      .pipe(gulp.dest(this.currentThemePath('languages')))

    return merge(compilePotFile, compilePotToMo)
  }

  /**
   * Auto bundling javascript using webpack
   */
  compileJS() {
    const srcPath = this.currentThemePath('assets-src', 'js', 'main.js')
    const destPath = this.currentThemePath('assets', 'js')
    const customWebpackConfigPath = this.currentThemePath('assets', 'js', 'webpack.config.js')

    let customConfig = {}
    if (existsSync(customWebpackConfigPath)) {
      customConfig = require(customWebpackConfigPath)
    }

    const defaultConfig = extend({
      context: destPath,

      entry: {
        main: srcPath
      },

      output: {
        library: this.themeDetails('slug'),
        libraryTarget: 'umd',
        filename: '[name].js',
        sourceMapFilename: '[name].map'
      },

      module: {
        rules: [
          {
            test: /\.js?$/,
            use: {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
                  require('babel-preset-es2015')
                ]
              }
            }
          }
        ]
      },

      externals: {
        jQuery: 'jQuery'
      },

      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
          }
        })
      ]
    }, customConfig)

    return gulp
      .src(srcPath)
      .pipe(webpackStream(defaultConfig, webpack))
      .pipe(gulp.dest(destPath))
  }
}

module.exports = DevCLI
