import path from 'path'

export const wordpressDir = process.cwd()
export const deuxConfig = '.deuxconfig'
export const deuxProject = '.deuxproject'
export const srcDir = path.join(path.resolve(__dirname, '..', '..'), 'src')
export const templateDir = path.join(srcDir, 'templates')
export const projectPath = path.join(wordpressDir, deuxProject)
export const wpConfigPath = path.join(wordpressDir, 'wp-config.php')
export const wpThemeDir = path.join(wordpressDir, 'wp-content', 'themes')
export const projectStatus = {
  NEW: 'new',
  EXISTING: 'existing'
}

export const validAddCommand = {
  PLUGIN: 'plugin',
  CSS: 'css',
  JS: 'js',
  SCSS: 'scss',
  TEMPLATE: 'template',
  COMPONENT: 'component',
  LOOP_TEMPLATE: 'loop-template',
  ACTION: 'action',
  FILTER: 'filter'
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
