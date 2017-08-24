const semver = require('semver')
const pluginInfo = require('wp-plugin-info')
const chalk = require('chalk')
const forceSemver = require('force-semver')
const cdnjs = require('cdnjs-api')
const {itemTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {loader, exit, done, finish} = global.deuxhelpers.require('logger')
const {separatorMaker} = global.deuxhelpers.require('util/cli')
const {libSource} = global.deuxcmd.require('add/cli/asset/fixtures')
const {pluginSrcTypes} = global.deuxcmd.require('add/cli/fixtures')

class UpgradeCLI extends CLI {
  constructor() {
    super()
    this.plugins = null
    this.assets = null
    this.loader = null
    this.init()
  }

  /**
   * Setup before action.
   */
  prepare() {
    this.plugins = this.themeInfo('plugins')
    this.assets = this.themeInfo('asset')
    this.title = 'Upgrade {Assets / Plugins}'
    this.prompts = [{}]
  }

  /**
   * Add hook before real action.
   */
  beforeAction() {
    return new Promise(resolve => {
      this.loader = loader('Check new version of assets / plugins')

      /**
       * Find upgradable plugins from WordPpress.org
       */
      const findUpgradablePlugins = () => new Promise((resolve, reject) => {
        const plugins = []

        // Add plugin to list.
        for (const slug in this.plugins) {
          if (Object.prototype.hasOwnProperty.call(this.plugins, slug) && this.plugins[slug].srctype === pluginSrcTypes.WP && this.plugins[slug].version) {
            const {version, name} = this.plugins[slug]
            plugins.push({
              slug,
              name,
              version,
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

      /**
       * Find upgradable assets from CDNJS
       */
      const findUpgradableAssets = () => new Promise((resolve, reject) => {
        const assets = []

        // Add asset to list.
        for (const slug in this.assets.libs) {
          if (Object.prototype.hasOwnProperty.call(this.assets.libs, slug) && this.assets.libs[slug].source === libSource.CDN) {
            const {version} = this.assets.libs[slug]
            assets.push({
              slug,
              version,
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
        const [pluginList, assetList] = upgradeList

        this.loader.stop()
        this.prompts = [
          {
            type: 'checkbox',
            name: 'upgradeItems',
            message: 'Choose which assets / plugins to update',
            when: () => pluginList.length > 0 || assetList.length > 0,
            choices: () => new Promise(resolve => {
              let list = []

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
            })
          }
        ]
        resolve()
      }).catch(exit)
    })
  }

  /**
   * Upgrade assets and plugins
   * @param {Object} {upgradeItems}
   */
  action({upgradeItems}) {
    if (!upgradeItems) {
      done({
        message: messages.SUCCEED_ALL_UPDATED,
        paddingBottom: true,
        exit: true
      })
    }

    Promise.all(upgradeItems.map(item => {
      return new Promise((resolve, reject) => {
        try {
          if (item.type === itemTypes.PLUGIN) {
            this.upgradePlugin(item.slug, item.latestVersion)
            resolve()
          } else if (item.type === itemTypes.ASSET) {
            // Assets upgrade script.
          }
        } catch (err) {
          reject(err)
        }
      })
    })).then(() => {
      finish(messages.SUCCEED_ALL_UPDATED)
    }).catch(exit)
  }
}

module.exports = UpgradeCLI
