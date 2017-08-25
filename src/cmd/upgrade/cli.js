const path = require('path')
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
              files: this.assets.libs[slug].files.map(file => file.path),
              type: itemTypes.ASSET
            })
          }
        }

        // Find new asset with new version.
        Promise.all(assets.map(asset => {
          return new Promise((resolve, reject) => {
            cdnjs.lib(asset.slug, {
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
            name: 'upgrade.items',
            message: 'Choose which assets / plugins to update',
            when: () => pluginList.length > 0 || assetList.length > 0,
            choices: () => new Promise(resolve => {
              let list = []

              let plugins = []
              if (pluginList.length > 0) {
                pluginList.forEach(item => {
                  plugins.push({
                    name: `${item.name} ${chalk.blue(item.version)} > ${chalk.green(item.latestVersion)}`,
                    value: item
                  })
                })
                plugins = separatorMaker('Plugins').concat(plugins)
                list = list.concat(plugins)
              }

              let assets = []
              if (assetList.length > 0) {
                assetList.forEach(item => {
                  assets.push({
                    name: `${item.slug} ${chalk.blue(item.version)} > ${chalk.green(item.latestVersion)}`,
                    value: item
                  })
                })
                assets = separatorMaker('Assets').concat(assets)
                list = list.concat(assets)
              }

              resolve(list)
            })
          },

          {
            type: 'checkbox',
            name: 'assets',
            message: 'Choose which files to update',
            when: ({upgrade}) => {
              if (upgrade && upgrade.items) {
                let assetItems = 0
                upgrade.items.forEach(item => {
                  if (item.type === itemTypes.ASSET) {
                    assetItems++
                  }
                })

                return assetItems > 0
              }

              return false
            },
            choices: ({upgrade}) => new Promise(resolve => {
              let list = []

              upgrade.items.filter(item => item.type === itemTypes.ASSET).reduce((promise, item) => {
                return promise.then(() => {
                  const assetSemver = `${item.slug}@${item.latestVersion}`

                  return new Promise((resolve, reject) => {
                    // Get files in latest version.
                    cdnjs.files(assetSemver).then(newFiles => {
                      let files = []

                      newFiles.forEach(file => {
                        files.push({
                          name: file,
                          checked: item.files.includes(file),
                          value: {
                            slug: item.slug,
                            file
                          }
                        })
                      })

                      if (files.length > 0) {
                        files = separatorMaker(assetSemver).concat(files)
                        list = list.concat(files)
                      }
                      resolve()
                    }).catch(reject)
                  })
                }).catch(exit)
              }, Promise.resolve()).then(() => {
                resolve(list)
              }).catch(exit)
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
  action({upgrade, assets}) {
    if (!upgrade) {
      done({
        message: messages.SUCCEED_ALL_UPDATED,
        paddingBottom: true,
        exit: true
      })
    }

    Promise.all(upgrade.items.map(item => {
      return new Promise((resolve, reject) => {
        try {
          if (item.type === itemTypes.PLUGIN) {
            this.plugins[item.slug].version = item.latestVersion
            this.setThemeConfig({
              plugins: this.plugins
            })
            resolve()
          } else if (item.type === itemTypes.ASSET) {
            // Assets upgrade script.
            const newFiles = []
            assets.filter(asset => asset.slug === item.slug).forEach(asset => {
              let existingFileObj

              this.assets.libs[item.slug].files.forEach(file => {
                if (file.path === asset.file) {
                  existingFileObj = file
                }
              })

              /* eslint-disable camelcase */
              const ext = path.extname(asset.file)
              let fileObj = {
                ext: ext.replace('.', ''),
                path: asset.file,
                is_active: true,
                deps: []
              }
              /* eslint-enable */

              if (existingFileObj) {
                fileObj = Object.assign(fileObj, existingFileObj)
              }

              newFiles.push(fileObj)
            })

            this.assets.libs[item.slug].version = item.latestVersion
            this.assets.libs[item.slug].files = newFiles
            this.setThemeConfig({
              asset: this.asset
            })
            resolve()
          }
        } catch (err) {
          reject(err)
        }
      })
    })).then(() => {
      finish(messages.SUCCEED_UPDATED)
    }).catch(exit)
  }
}

module.exports = UpgradeCLI
