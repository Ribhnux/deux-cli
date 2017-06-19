const gutil = require('gulp-util')
const through = require('through2')

const pluginName = 'gulp-beautify-css-comment'

module.exports = () => through.obj(function (file, encoding, callback) {
  if (file.isNull()) {
    callback(null, file)
  }

  if (file.isStream()) {
    callback(new gutil.PluginError(pluginName, 'Streaming not supported'))
    return
  }

  try {
    const contents = String(file.contents)

    file.contents = Buffer.from(
      contents.replace(/}\/\*!/g, '}\n\n/*!').replace(/\*\//g, '*/\n')
    )

    this.push(file)
  } catch (err) {
    this.emit('error', new gutil.PluginError(pluginName, err, {fileName: file.path}))
  }

  callback()
})
