const path = require('path')

const root = path.resolve(__dirname, '..')
const wpPath = path.resolve(__dirname, 'wordpress')
const {dbTypes} = require(path.join(root, 'src', 'cli', 'fixtures'))

module.exports = {
  root,
  wpPath,
  dbTypes,
  deux: path.join(root, 'bin', 'deux'),
  dbPath: path.resolve(__dirname, '.deuxproject'),
  themePath: path.join(wpPath, 'wp-content', 'themes', 'deux-theme')
}
