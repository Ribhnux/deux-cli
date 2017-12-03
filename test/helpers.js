const path = require('path')
const execa = require('execa')
const rimraf = require('rimraf')
const jsonr = require('json-realtime')
const jsonar = require('jsonar')
const arrandel = require('arrandel')
const {deux, dbPath, dbTypes, themePath} = require('./fixtures')

exports.getConfig = (configStr = '') => {
  const db = jsonr(dbPath)
  const slug = db[dbTypes.CURRENT].slug
  const currentTheme = Object.assign({}, db[dbTypes.THEMES][slug])
  const configPath = path.join(themePath, `${slug}-config.php`)
  const themeConfig = Object.assign({}, currentTheme)
  /* eslint-disable camelcase */
  const emptyRules = {
    asset: {
      libs: {},
      sass: {
        components: [],
        layouts: [],
        pages: [],
        themes: [],
        vendors: []
      },
      fonts: {}
    },
    plugins: {},
    components: [],
    imgsize: {},
    filters: [],
    actions: [],
    libraries: [],
    helpers: [],
    menus: {},
    widgets: {},
    features: {},
    customizer: {
      panels: {},
      sections: {},
      settings: {},
      control_types: {},
      controls: {}
    }
  }
  /* eslint-enable camelcase */

  const phpArray = arrandel(configPath)
  const phpConfig = jsonar.parse(phpArray.deux_theme_config, {
    emptyRules
  })

  if (configStr !== '') {
    return phpConfig[configStr]
  }

  return {
    db,
    slug,
    themeConfig,
    phpConfig,
    path: configPath
  }
}

exports.cleanupTheme = () => {
  rimraf.sync(path.join(themePath))
}

exports.cleanupDb = () => {
  rimraf.sync(dbPath)
}

exports.runCli = (cmd, config) => {
  const input = typeof config === 'string' ? config : JSON.stringify(config)
  const options = cmd.concat([`--db=${dbPath}`, `--input=${input}`])
  return execa.stdout(deux, options)
}
