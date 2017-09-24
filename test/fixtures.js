const path = require('path')

const root = path.resolve(__dirname, '..')
exports.root = root
exports.deux = path.join(root, 'bin', 'deux')
exports.dbPath = path.resolve(__dirname, '.deuxproject')
exports.wpPath = path.resolve(__dirname, 'wordpress')

const {dbTypes} = require(path.join(root, 'src', 'cli', 'fixtures'))
exports.dbTypes = dbTypes
