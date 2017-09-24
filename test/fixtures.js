const path = require('path')

const root = path.resolve(__dirname, '..')
exports.deux = path.join(root, 'bin', 'deux')
exports.dbPath = path.resolve(__dirname, '.deuxproject')
exports.wpPath = path.resolve(__dirname, 'wordpress')
