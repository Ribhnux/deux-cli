const gulp = require('gulp')
const browserSync = require('browser-sync')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const srcmap = require('gulp-sourcemaps')
const cssbeautify = require('gulp-cssbeautify')
const stripComments = require('gulp-strip-css-comments')
const merge = require('gulp-merge')
const clone = require('gulp-clone')
const replacer = require('gulp-replace')

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
      'start-server',
      'watch-sass'
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
      .pipe(
        sass({
          outputStyle: 'compressed'
        })
      )
      .pipe(rename('main.css'))

    // Compile main.css
    const style = compiledCSS
      .pipe(clone())
      .pipe(cssbeautify({indent: '  ', autosemicolon: true}))
      .pipe(replacer(/}\/\*!/g, '}\n\n/*!'))
      .pipe(replacer(/\*\//g, '*/\n'))
      .pipe(gulp.dest(destPath))

    // Compile main.min.css
    const minStyle = compiledCSS
      .pipe(clone())
      .pipe(stripComments({preserve: false}))
      .pipe(
        srcmap.init({
          loadMaps: true
        })
      )
      .pipe(rename({suffix: '.min'}))
      .pipe(srcmap.write('./'))
      .pipe(gulp.dest(destPath))

    return merge(style, minStyle)
  }
}

module.exports = DevCLI
