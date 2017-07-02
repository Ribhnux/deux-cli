exports.validAddCommand = {
  ASSET: 'asset',
  PLUGIN: 'plugin',
  MENU: 'menu',
  WIDGET: 'widget',
  FEATURE: 'feature',
  TEMPLATE: 'template',
  COMPONENT: 'component',
  CUSTOMIZER: 'customizer',
  HOOK: 'hook'
}

exports.templateTypes = {
  PARTIAL: 'partial',
  PAGE: 'page'
}

exports.postTypes = {
  POST: 'post',
  PAGE: 'page',
  CUSTOM: 'custom'
}

exports.pluginSrcTypes = {
  WP: 'wp',
  PRIVATE: 'private'
}
exports.featureTypes = {
  HTML5: 'html5',
  FEED_LINKS: 'autmatic-feed-links',
  POST_FORMATS: 'post-formats',
  POST_THUMBNAILS: 'post-thumbnails',
  CUSTOM_BACKGROUND: 'custom-background',
  CUSTOM_HEADER: 'custom-header',
  CUSTOM_LOGO: 'custom-logo'
}

exports.featureLabels = {
  HTML5: 'HTML5 Theme Markup',
  FEED_LINKS: 'Automatic Feed Links',
  POST_FORMATS: 'Post Formats',
  POST_THUMBNAILS: 'Post Thumbnails',
  CUSTOM_BACKGROUND: 'Custom Background',
  CUSTOM_HEADER: 'Custom Header',
  CUSTOM_LOGO: 'Custom Logo'
}

exports.html5markup = [
  'comment-list',
  'comment-form',
  'search-form',
  'gallery',
  'caption'
]

exports.postFormats = [
  'aside',
  'gallery',
  'link',
  'image',
  'quote',
  'status',
  'video',
  'audio',
  'chat'
]

exports.bgPresetTypes = {
  DEFAULT: 'default',
  FILL: 'fill',
  FIT: 'fit',
  REPEAT: 'repeat',
  CUSTOM: 'custom'
}

exports.bgPresetLabels = {
  DEFAULT: 'Default',
  FILL: 'Fill Screen',
  FIT: 'Fit to Screen',
  REPEAT: 'Repeat',
  CUSTOM: 'Custom'
}

exports.bgPositionTypes = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom'
}

exports.bgSizeTypes = {
  COVER: 'cover',
  CONTAIN: 'contain',
  AUTO: 'auto'
}

exports.bgRepeatTypes = {
  REPEAT: 'repeat',
  NO_REPEAT: 'no-repeat'
}

exports.bgAttachmentTypes = {
  SCROLL: 'scroll',
  FIXED: 'fixed'
}
