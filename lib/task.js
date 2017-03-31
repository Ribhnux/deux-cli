const gulp = require('gulp')

exports.test = () => {
  console.log('abc')
}

exports.run = name => {
  gulp.task('abc', exports.test)
  gulp.watch(exports.test)
}
