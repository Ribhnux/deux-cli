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
      'watch-sass',
      'watch-theme-config',
      'start-server'
    ]

    const themeDetails = this.themeDetails()

    /**
     * Start browser-sync server
     */
    gulp.task('start-server', () => {
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
      this.compileCSS()
    })

    // SASS Watcher
    gulp.task('watch-sass', () => {
      return watch([
        this.currentThemePath('assets-src', 'sass', '**', '*.scss'),
        this.currentThemePath('assets-src', 'sass', 'main.scss')
      ], () => {
        this.compileCSS()
      })
    })

    // Watch theme-config.php
    gulp.task('watch-theme-config', () => {
      return watch([
        this.currentThemeConfigPath()
      ], () => {
        this.sync()
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
   * Compile CSS
   */
  compileCSS() {
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

    const compiledCSS = gulp
      .src(this.currentThemePath('assets-src', 'sass', 'main.scss'))
      .pipe(gulpPlumber)
      .pipe(sass({
        outputStyle: 'compressed'
      }))
      .pipe(rename('main.css'))

    // Compile main stylesheet
    const compiler = (basename = 'main', isRTL = false, beautify = true) => {
      let output = compiledCSS
        .pipe(clone()).pipe(replacer(rtlRegx, isRTL ? '/*rtl$1*/;' : ';'))

      if (isRTL) {
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

    // Compile main.css
    const style = compiler()

    // Compile RTL Stylesheet main-rtl.css
    const rtlStyle = compiler('main-rtl', true)

    // Compile main.min.css
    const minStyle = compiler('main.min', false, false)

    // Compile RTL Stylesheet minified main-rtl.min.css
    const rtlMinStyle = compiler('main.min-rtl', true, false)

    return merge([
      style,
      rtlStyle,
      minStyle,
      rtlMinStyle
    ])
  }
}

module.exports = DevCLI
