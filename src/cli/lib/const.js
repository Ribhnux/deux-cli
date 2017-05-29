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

export const assetType = {
  LIB: 'lib',
  SCSS: 'scss',
  FONT: 'font'
}

export const assetSource = {
  CDN: 'cdn',
  WP: 'wordpress'
}

export const scssType = {
  COMPONENT: 'component',
  LAYOUT: 'layout',
  PAGE: 'page',
  THEMES: 'theme',
  VENDOR: 'vendor'
}

export const registeredScript = [
  {
    name: 'Jcrop',
    handle: 'jcrop'
  },
  {
    name: 'SWFObject',
    handle: 'swfobject'
  },
  {
    name: 'SWFUpload',
    handle: 'swfupload'
  },
  {
    name: 'SWFUpload Degrade',
    handle: 'swfupload-degrade'
  },
  {
    name: 'SWFUpload Queue',
    handle: 'swfupload-queue'
  },
  {
    name: 'SWFUpload Handlers',
    handle: 'swfupload-handlers'
  },
  {
    name: 'jQuery',
    handle: 'jquery'
  },
  {
    name: 'jQuery Form',
    handle: 'jquery-form',
    deps: ['jquery']
  },
  {
    name: 'jQuery Color',
    handle: 'jquery-color',
    deps: ['jquery']
  },
  {
    name: 'jQuery Masonry',
    handle: 'jquery-masonry',
    deps: ['jquery']
  },
  {
    name: 'Masonry',
    handle: 'masonry',
    deps: ['imagesloaded']
  },
  {
    name: 'jQuery UI Core',
    handle: 'jquery-ui-core',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Widget',
    handle: 'jquery-ui-widget',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Accordion',
    handle: 'jquery-ui-accordion',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Autocomplete',
    handle: 'jquery-ui-autocomplete',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Button',
    handle: 'jquery-ui-button',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Datepicker',
    handle: 'jquery-ui-datepicker',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Dialog',
    handle: 'jquery-ui-dialog',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Draggable',
    handle: 'jquery-ui-draggable',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Droppable',
    handle: 'jquery-ui-droppable',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Menu',
    handle: 'jquery-ui-menu',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Mouse',
    handle: 'jquery-ui-mouse',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Position',
    handle: 'jquery-ui-position',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Progressbar',
    handle: 'jquery-ui-progressbar',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Selectable',
    handle: 'jquery-ui-selectable',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Resizable',
    handle: 'jquery-ui-resizable',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Selectmenu',
    handle: 'jquery-ui-selectmenu',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Sortable',
    handle: 'jquery-ui-sortable',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Slider',
    handle: 'jquery-ui-slider',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Spinner',
    handle: 'jquery-ui-spinner',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Tooltips',
    handle: 'jquery-ui-tooltip',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Tabs',
    handle: 'jquery-ui-tabs',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Effects',
    handle: 'jquery-effects-core',
    deps: ['jquery']
  },
  {
    name: 'jQuery UI Effects – Blind',
    handle: 'jquery-effects-blind',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Bounce',
    handle: 'jquery-effects-bounce',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Clip',
    handle: 'jquery-effects-clip',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Drop',
    handle: 'jquery-effects-drop',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Explode',
    handle: 'jquery-effects-explode',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Fade',
    handle: 'jquery-effects-fade',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Fold',
    handle: 'jquery-effects-fold',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Highlight',
    handle: 'jquery-effects-highlight',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Pulsate',
    handle: 'jquery-effects-pulsate',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Scale',
    handle: 'jquery-effects-scale',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Shake',
    handle: 'jquery-effects-shake',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Slide',
    handle: 'jquery-effects-slide',
    deps: ['jquery-effects-core']
  },
  {
    name: 'jQuery UI Effects – Transfer',
    handle: 'jquery-effects-transfer',
    deps: ['jquery-effects-core']
  },
  {
    name: 'WP Media Element',
    handle: 'wp-mediaelement',
    deps: ['jquery']
  },
  {
    name: 'jQuery Schedule',
    handle: 'schedule',
    deps: ['jquery']
  },
  {
    name: 'jQuery Suggest',
    handle: 'suggest',
    deps: ['jquery']
  },
  {
    name: 'ThickBox',
    handle: 'thickbox'
  },
  {
    name: 'jQuery Hover Intent',
    handle: 'hoverIntent',
    deps: ['jquery']
  },
  {
    name: 'jQuery Hotkeys',
    handle: 'jquery-hotkeys',
    deps: ['jquery']
  },
  {
    name: 'Simple AJAX Code-Kit',
    handle: 'sack'
  },
  {
    name: 'QuickTags',
    handle: 'quicktags'
  },
  {
    name: 'Iris (Colour picker)',
    handle: 'iris',
    deps: ['jquery']
  },
  {
    name: 'Tiny MCE',
    handle: 'tiny_mce'
  },
  {
    name: 'Autosave',
    handle: 'autosave'
  },
  {
    name: 'WordPress AJAX Response',
    handle: 'wp-ajax-response'
  },
  {
    name: 'List Manipulation',
    handle: 'wp-lists'
  },
  {
    name: 'WP Common',
    handle: 'common'
  },
  {
    name: 'WP Editor',
    handle: 'editorremov'
  },
  {
    name: 'WP Editor Functions',
    handle: 'editor-functions'
  },
  {
    name: 'AJAX Cat',
    handle: 'ajaxcat'
  },
  {
    name: 'Admin Categories',
    handle: 'admin-categories'
  },
  {
    name: 'Admin Tags',
    handle: 'admin-tags'
  },
  {
    name: 'Admin custom fields',
    handle: 'admin-custom-fields'
  },
  {
    name: 'Password Strength Meter',
    handle: 'password-strength-meter'
  },
  {
    name: 'Admin Comments',
    handle: 'admin-comments'
  },
  {
    name: 'Admin Users',
    handle: 'admin-users'
  },
  {
    name: 'Admin Forms',
    handle: 'admin-forms'
  },
  {
    name: 'XFN',
    handle: 'xfn'
  },
  {
    name: 'Upload',
    handle: 'upload'
  },
  {
    name: 'PostBox',
    handle: 'postbox'
  },
  {
    name: 'Slug',
    handle: 'slug'
  },
  {
    name: 'Post',
    handle: 'post'
  },
  {
    name: 'Page',
    handle: 'page'
  },
  {
    name: 'Link',
    handle: 'link'
  },
  {
    name: 'Comment',
    handle: 'comment'
  },
  {
    name: 'Threaded Comments',
    handle: 'comment-reply'
  },
  {
    name: 'Admin Gallery',
    handle: 'admin-gallery'
  },
  {
    name: 'Media Upload',
    handle: 'media-upload'
  },
  {
    name: 'Admin widgets',
    handle: 'admin-widgets'
  },
  {
    name: 'Word Count',
    handle: 'word-count'
  },
  {
    name: 'Theme Preview',
    handle: 'theme-preview'
  },
  {
    name: 'JSON for JS',
    handle: 'json2'
  },
  {
    name: 'Plupload Core',
    handle: 'plupload'
  },
  {
    name: 'Plupload All Runtimes',
    handle: 'plupload-all'
  },
  {
    name: 'Plupload HTML4',
    handle: 'plupload-html4'
  },
  {
    name: 'Plupload HTML5',
    handle: 'plupload-html5'
  },
  {
    name: 'Plupload Flash',
    handle: 'plupload-flash'
  },
  {
    name: 'Plupload Silverlight',
    handle: 'plupload-silverlight'
  },
  {
    name: 'Underscore js',
    handle: 'underscore'
  },
  {
    name: 'Backbone js',
    handle: 'backbone'
  },
  {
    name: 'imagesLoaded',
    handle: 'imagesloaded'
  }
]

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
