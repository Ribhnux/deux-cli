const path = require('path')
const wpDir = process.cwd()
const configFileName = '.deuxconfig'
const projectFileName = '.deuxproject'

exports.CONFIG_FILENAME = configFileName
exports.PROJECT_FILENAME = projectFileName
exports.WP_DIR = wpDir
exports.WP_CONFIG_PATH = path.join(wpDir, 'wp-config.php')
exports.WP_THEME_DIR = path.join(wpDir, 'wp-content', 'themes')
exports.PROJECT_FILE_PATH = path.join(wpDir, projectFileName)
exports.PROJECT_STATUS_NEW = 'new'
exports.PROJECT_STATUS_EXISTING = 'existing'
exports.THEME_VALID_TAGS = [
  'one-column',
  'two-columns',
  'three-columns',
  'four-columns',
  'left-sidebar',
  'right-sidebar',
  'grid-layout',
  'flexible-header',
  'accessibility-ready',
  'buddypress',
  'custom-background',
  'custom-colors',
  'custom-header',
  'custom-menu',
  'custom-logo',
  'editor-style',
  'featured-image-header',
  'featured-images',
  'footer-widgets',
  'front-page-post-form',
  'full-width-template',
  'microformats',
  'post-formats',
  'rtl-language-support',
  'sticky-post	Visually',
  'theme-options',
  'threaded-comments',
  'translation-ready',
  'blog',
  'e-commerce',
  'education',
  'entertainment',
  'food-and-drink',
  'holiday',
  'news',
  'photography',
  'portfolio'
]
