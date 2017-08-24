const semver = require('semver')
const pluginInfo = require('wp-plugin-info')
const chalk = require('chalk')
const forceSemver = require('force-semver')
const cdnjs = require('cdnjs-api')
const {itemTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const {loader, exit} = global.deuxhelpers.require('logger')
const {separatorMaker} = global.deuxhelpers.require('util/cli')
const {libSource} = global.deuxcmd.require('add/cli/asset/fixtures')

class UpgradeCLI extends CLI {
  constructor() {
    super()
    this.plugins = null
    this.assets = null
    this.loader = null
    this.init()
  }

  beforeInit() {
    this.loader = loader('Check new version of assets / plugins')
  }

  prepare() {
    this.plugins = this.themeInfo('plugins')
    this.assets = this.themeInfo('asset')
    this.title = 'Upgrade {Assets / Plugins}'

    const findUpgradablePlugins = () => new Promise((resolve, reject) => {
      const plugins = []

      // Add plugin to list.
      for (const slug in this.plugins) {
        if (Object.prototype.hasOwnProperty.call(this.plugins, slug)) {
          const {version, name} = this.plugins[slug]
          plugins.push({
            slug,
            name,
            version: version,
            type: itemTypes.PLUGIN
          })
        }
      }

      // Find new plugin with new version.
      Promise.all(plugins.map(plugin => {
        return new Promise((resolve, reject) => {
          pluginInfo.version(plugin.slug).then(latestVersion => {
            const needUpgrade = semver.gt(forceSemver(latestVersion), forceSemver(plugin.version))
            if (needUpgrade) {
              plugin.latestVersion = latestVersion
              resolve(plugin)
            } else {
              resolve({})
            }
          }).catch(reject)
        })
      })).then(result => {
        const pluginNeedUpgrades = result.filter(item => item && item.version)
        resolve(pluginNeedUpgrades)
      }).catch(err => {
        reject(err)
      })
    })

    const findUpgradableAssets = () => new Promise((resolve, reject) => {
      const assets = []

      // Add asset to list.
      for (const slug in this.assets.libs) {
        if (Object.prototype.hasOwnProperty.call(this.assets.libs, slug) && this.assets.libs[slug].source === libSource.CDN) {
          const {version} = this.assets.libs[slug]
          assets.push({
            slug,
            version: version,
            type: itemTypes.ASSET
          })
        }
      }

      // Find new asset with new version.
      Promise.all(assets.map(asset => {
        return new Promise((resolve, reject) => {
          cdnjs.search(asset.slug, {
            fields: {
              version: true
            }
          }).then(result => {
            const needUpgrade = semver.gt(forceSemver(result.version), forceSemver(asset.version))
            if (needUpgrade) {
              asset.latestVersion = result.version
              resolve(asset)
            } else {
              resolve({})
            }
          }).catch(err => {
            reject(err)
          })
        })
      })).then(result => {
        const assetNeedUpgrades = result.filter(item => item && item.version)
        resolve(assetNeedUpgrades)
      }).catch(err => {
        reject(err)
      })
    })

    this.prompts = [
      {
        type: 'checkbox',
        name: 'assets',
        message: 'Choose which assets / plugins to update',
        choices: () => new Promise(resolve => {
          let list = []

          Promise.all([
            new Promise((resolve, reject) => {
              findUpgradablePlugins().then(item => {
                resolve(item)
              }).catch(reject)
            }),

            new Promise((resolve, reject) => {
              findUpgradableAssets().then(item => {
                resolve(item)
              }).catch(reject)
            })
          ]).then(upgradeList => {
            this.loader.stop()

            let [pluginList, assetList] = upgradeList

            if (pluginList.length > 0) {
              list = separatorMaker('Plugins').concat(list)
              pluginList.forEach(item => {
                list.push({
                  name: `${item.name} ${chalk.blue(item.version)} > ${chalk.green(item.latestVersion)}`,
                  value: item
                })
              })
            }

            if (assetList.length > 0) {
              list = separatorMaker('Assets').concat(list)
              assetList.forEach(item => {
                list.push({
                  name: `${item.slug} ${chalk.blue(item.version)} > ${chalk.green(item.latestVersion)}`,
                  value: item
                })
              })
            }

            resolve(list)
          }).catch(exit)
        })
      }
    ]
  }

  action() {
    console.log(this.plugins)
  }
}

module.exports = UpgradeCLI
