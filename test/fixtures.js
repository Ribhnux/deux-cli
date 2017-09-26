const path = require('path')

const root = path.resolve(__dirname, '..')
const wpPath = path.resolve(__dirname, 'wordpress')

exports.root = root
exports.deux = path.join(root, 'bin', 'deux')
exports.dbPath = path.resolve(__dirname, '.deuxproject')
exports.wpPath = wpPath

const {dbTypes} = require(path.join(root, 'src', 'cli', 'fixtures'))
exports.dbTypes = dbTypes
exports.themePath = path.join(wpPath, 'wp-content', 'themes', 'deux-theme')
