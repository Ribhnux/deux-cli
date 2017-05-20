import path from 'path'

export const wordpressDir = process.cwd()
export const srcDir = path.join(path.resolve(__dirname, '..', '..'), 'src')
export const templateDir = path.join(srcDir, 'templates')
export const dbFilename = '.deuxproject'
export const dbPath = path.join(wordpressDir, dbFilename)
export const wpConfigPath = path.join(wordpressDir, 'wp-config.php')
export const wpThemeDir = path.join(wordpressDir, 'wp-content', 'themes')

export const templateType = {
  PARTIAL: 'partial',
  PAGE: 'page'
}

export const projectStatus = {
  NEW: 'new',
  EXISTING: 'existing'
}

export const status = {
  MISSING: 404
}

export const pluginSourceType = {
  WP: 'wordpress',
  PRIVATE: 'private'
}

export const validAddCommand = {
  HOOK: 'hook',
  ASSET: 'asset',
  PLUGIN: 'plugin',
  FEATURE: 'feature',
  TEMPLATE: 'template',
  COMPONENT: 'component'
}

export const validListCommand = {
  HOOK: 'hook',
  ASSET: 'asset',
  PLUGIN: 'plugin',
  FEATURE: 'feature',
  TEMPLATE: 'template',
  COMPONENT: 'component',
  PROJECT: 'project'
}

export const validTags = [
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
