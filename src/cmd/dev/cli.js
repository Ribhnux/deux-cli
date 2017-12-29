const path = require('path')
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
const autoPrefixr = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const wpPot = require('gulp-wp-pot')
const gettext = require('gulp-gettext')
const replacer = require('gulp-replace')
const cssbeautify = require('gulp-cssbeautify')
const stripComments = require('gulp-strip-css-comments')

const CLI = global.deuxcli.require('main')

class DevCLI extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup gulp task
   */
  prepare() {
    this.$title = 'Start {development} mode'

    // Source Path
    this.srcPath = {
      ASSET_SASS: this.currentThemePath('assets-src', 'sass'),
      ASSET_JS: this.currentThemePath('assets-src', 'js'),
      CUSTOMIZER_ASSET_SASS: this.currentThemePath('includes', 'customizers', 'assets-src', 'sass'),
      CUSTOMIZER_ASSET_JS: this.currentThemePath('includes', 'customizers', 'assets-src', 'js')
    }

    // Destination Path
    this.dstPath = {
      ASSET_CSS: this.currentThemePath('assets', 'css'),
      ASSET_JS: this.currentThemePath('assets', 'js'),
      CUSTOMIZER_ASSET_CSS: this.currentThemePath('includes', 'customizers', 'assets', 'css'),
      CUSTOMIZER_ASSET_JS: this.currentThemePath('includes', 'customizers', 'assets', 'js')
    }

    // Main stylesheet compiler
    gulp.task('build:style', this.sassCompiler('theme.scss', {
      srcPath: this.srcPath.ASSET_SASS,
      dstPath: this.dstPath.ASSET_CSS,
      rtl: true
    }))

    // Customizer stylesheet compiler
    gulp.task('build:customizer-style', this.sassCompiler('customizer.scss', {
      srcPath: this.srcPath.CUSTOMIZER_ASSET_SASS,
      dstPath: this.dstPath.CUSTOMIZER_ASSET_CSS,
      rtl: true
    }))

    // Editor stylesheet compiler
    gulp.task('build:editor-style', this.sassCompiler('editor-style.scss', {
      srcPath: this.srcPath.ASSET_SASS,
      dstPath: this.dstPath.ASSET_CSS
    }))

    // Javascript bundler
    gulp.task('build:js', this.jsCompiler('theme.js', {
      srcPath: this.srcPath.ASSET_JS,
      dstPath: this.dstPath.ASSET_JS
    }))

    // Customizer Control Javascript bundler
    gulp.task('build:customizer-control', this.jsCompiler('customizer-control.js', {
      srcPath: this.srcPath.CUSTOMIZER_ASSET_JS,
      dstPath: this.dstPath.CUSTOMIZER_ASSET_JS
    }))

    // Customizer Control Javascript bundler
    gulp.task('build:customizer-preview', this.jsCompiler('customizer-preview.js', {
      srcPath: this.srcPath.CUSTOMIZER_ASSET_JS,
      dstPath: this.dstPath.CUSTOMIZER_ASSET_JS
    }))

    // Watch theme-config.php
    gulp.task('sync:config', () => {
      this.sync()
    })

    // Auto compile pot file
    gulp.task('build:translation', () => {
      this.compilePot()
    })

    // Files watcher
    gulp.task('watch:files', () => {
      // Build assets/css/theme.css
      gulp.watch([
        path.join(this.srcPath.ASSET_SASS, '**', '*.scss'),
        path.join(this.srcPath.ASSET_SASS, 'theme.scss')
      ], ['build:style'])

      gulp.watch([
        path.join(this.srcPath.ASSET_SASS, 'editor-style.scss')
      ], ['build:editor-style'])

      // Build includes/customizers/assets/customizer.css
      gulp.watch([
        path.join(this.srcPath.CUSTOMIZER_ASSET_SASS, '**', '*.scss'),
        path.join(this.srcPath.CUSTOMIZER_ASSET_SASS, 'customizer.scss')
      ], ['build:customizer-style'])

      // Build assets/js/theme.js
      gulp.watch([
        path.join(this.srcPath.ASSET_JS, 'theme.js'),
        '!' + path.join(this.srcPath.ASSET_JS, 'node_modules', '**', '*.js')
      ], ['build:js'])

      // Build customizer-control.js and customizer-preview.js
      gulp.watch([
        path.join(this.srcPath.CUSTOMIZER_ASSET_JS, 'customizer-control.js'),
        path.join(this.srcPath.CUSTOMIZER_ASSET_JS, 'customizer-preview.js'),
        '!' + path.join(this.srcPath.ASSET_JS, 'node_modules', '**', '*.js')
      ], ['build:customizer-control', 'build:customizer-preview'])

      // Synchronize config
      gulp.watch([
        this.currentThemeConfigPath()
      ], ['sync:config'])

      // Build translation
      gulp.watch([
        this.currentThemePath('**', '*.php'),
        this.currentThemePath('*.php')
      ], ['build:translation'])
    })
  }

  /**
   * Start gulp
   */
  action() {
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
      gulp.start([
        'build:style',
        'build:customizer-style',
        'build:editor-style',
        'build:js',
        'build:customizer-control',
        'build:customizer-preview',
        'build:translation',
        'sync:config'
      ])
    }).then(() => {
      gulp.start(['watch:files'])
    }).catch(this.$logger.exit)
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
        .pipe(sass({
          outputStyle: 'compressed'
        }))
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
          .pipe(rtlcss())
          .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
          .pipe(replacer(/}\/\*!/g, '}\n\n/*!'))
          .pipe(replacer(/\*\//g, '*/\n'))
          .pipe(rename({
            suffix: '-rtl'
          }))
          .pipe(gulp.dest(options.dstPath))

        // Compile RTL Minified Style
        RTLMinStyle = RTLStyle.pipe(clone())
          .pipe(cleanCSS({
            compatibility: 'ie8'
          }))
          .pipe(stripComments({preserve: false}))
          .pipe(sourceMaps.init())
          .pipe(rename({
            suffix: '.min'
          }))
          .pipe(sourceMaps.write('./'))
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
        .pipe(cleanCSS({
          compatibility: 'ie8'
        }))
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(stripComments({preserve: false}))
        .pipe(sourceMaps.init())
        .pipe(sourceMaps.write('./'))
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
    return () => rollup({
      input: path.join(options.srcPath, inputFile),
      sourcemap: false,
      format: 'iife',
      plugins: babel({
        presets: [
          [require.resolve('babel-preset-env'), {modules: false}]
        ],
        babelrc: false
      })
    })
      // Beautify
      .pipe(source(inputFile, options.srcPath))
      .pipe(plumber())
      .pipe(buffer())
      .pipe(gulp.dest(options.dstPath))
      // Minify
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(uglify())
      .pipe(sourceMaps.init())
      .pipe(sourceMaps.write('./'))
      .pipe(gulp.dest(options.dstPath))
  }

  /**
   * Auto compile translation for all php source in theme
   */
  compilePot() {
    const themeDetails = this.themeDetails()
    const potFilePath = this.currentThemePath('languages', `${themeDetails.slug}.pot`)

    const compilePotFile = gulp
      .src(this.currentThemePath('**', '*.php'))
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
