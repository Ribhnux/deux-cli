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
  POST_FORMATS: 'post-formats',
  POST_THUMBNAILS: 'post-thumbnails',
  CUSTOM_BACKGROUND: 'custom-background',
  CUSTOM_HEADER: 'custom-header',
  CUSTOM_LOGO: 'custom-logo'
}

exports.featureLabels = {
  HTML5: 'HTML5 Theme Markup',
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

exports.positionTypes = {
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

exports.hookTypes = {
  FILTER: 'filter',
  ACTION: 'action'
}

exports.customizerControlTypes = {
  TEXT: 'text',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SELECT: 'select',
  RANGE: 'range',
  EMAIL: 'email',
  URL: 'url',
  PAGES_DROPDOWN: 'dropdown-pages',
  COLOR_PICKER: 'color-picker',
  UPLOAD: 'uploader',
  IMAGE_PICKER: 'image-picker',
  MEDIA_PICKER: 'media-picker',
  CUSTOM: 'custom'
}

exports.customizerControlLabels = {
  TEXT: 'Text',
  NUMBER: 'Number',
  CHECKBOX: 'Checkbox',
  RADIO: 'Radiobox',
  SELECT: 'Dropdown List',
  RANGE: 'Range Slider',
  EMAIL: 'Email Address',
  URL: 'URL Address',
  PAGES_DROPDOWN: 'Pages Selector',
  COLOR_PICKER: 'Color Picker',
  UPLOAD: 'File Uploader',
  IMAGE_PICKER: 'Image Uploader',
  MEDIA_PICKER: 'Custom Media Uploader',
  CUSTOM: 'New Control'
}

exports.customizerSectionTypes = {
  THEMES: 'themes',
  TITLE_TAGLINE: 'title_tagline',
  COLORS: 'colors',
  HEADER_IMAGE: 'header_image',
  BACKGROUND_IMAGE: 'background_image',
  STATIC_FRONT_PAGE: 'static_front_page',
  CUSTOM_CSS: 'custom_css',
  CUSTOM: 'custom'
}

exports.customizerSectionLabels = {
  THEMES: 'Themes Chooser',
  TITLE_TAGLINE: 'Site Identity',
  COLORS: 'Colors',
  HEADER_IMAGE: 'Header Image',
  BACKGROUND_IMAGE: 'Background Image',
  STATIC_FRONT_PAGE: 'Static Front Page',
  CUSTOM_CSS: 'Custom CSS',
  CUSTOM: 'New Section'
}

exports.customizerPanelTypes = {
  NAVIGATION: 'nav_menus',
  WIDGETS: 'widget',
  CUSTOM: 'custom'
}

exports.customizerPanelLabels = {
  NAVIGATION: 'Navigation Menus',
  WIDGETS: 'Widgets',
  CUSTOM: 'New Panel'
}
