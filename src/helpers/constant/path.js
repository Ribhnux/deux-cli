const path = require('path')

const wordpressDir = process.cwd()

exports.wordpressDir = wordpressDir
exports.wpConfigPath = path.join(wordpressDir, 'wp-config.php')
exports.wpThemeDir = path.join(wordpressDir, 'wp-content', 'themes')
exports.dbPath = path.join(wordpressDir, '.deuxproject')
