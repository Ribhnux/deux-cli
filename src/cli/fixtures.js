const path = require('path')

exports.dbTypes = {
  CONFIG: 'deux.config',
  CURRENT: 'deux.current',
  THEMES: 'deux.themes'
}

exports.dbPath = path.join(process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Preferences') : process.env.HOME), '.deuxproject')

exports.commandList = {
  THEME: 'theme',
  ASSET: 'asset',
  PLUGIN: 'plugin',
  MENU: 'menu',
  WIDGET: 'widget',
  FEATURE: 'feature',
  TEMPLATE: 'template',
  COMPONENT: 'component',
  CUSTOMIZER: 'customizer',
  IMGSIZE: 'imgsize',
  HELPER: 'helper',
  LIBCLASS: 'libclass',
  HOOKS: 'hooks'
}
