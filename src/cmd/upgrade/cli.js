const semver = require('semver')
const pluginInfo = require('wp-plugin-info')
const chalk = require('chalk')
const {itemTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const {colorlog, exit} = global.deuxhelpers.require('logger')
const {separatorMaker} = global.deuxhelpers.require('util/cli')

class UpgradeCLI extends CLI {
  constructor() {
    super()
    this.plugins = null
    this.assets = null
    this.init()
  }

  prepare() {
    this.plugins = this.themeInfo('plugins')
    this.assets = this.themeInfo('assets')
    this.title = 'Upgrade {Assets / Plugins}'

    const findUpgradablePlugin = () => new Promise((resolve, reject) => {
      const plugins = []

      // Add plugin to list.
      for (const slug in this.plugins) {
        if (Object.prototype.hasOwnProperty.call(this.plugins, slug)) {
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
            const needUpgrade = semver.gt(latestVersion, plugin.version)
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

    this.prompts = [
      {
        type: 'checkbox',
        name: 'assets',
        message: 'Choose which assets / plugins to update',
        choices: () => new Promise(resolve => {
          let list = []

          Promise.all([
            new Promise((resolve, reject) => {
              findUpgradablePlugin().then(item => {
                resolve(item)
              }).catch(reject)
            })
          ]).then(upgradeList => {
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

            console.log('bababaa', pluginList)
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
