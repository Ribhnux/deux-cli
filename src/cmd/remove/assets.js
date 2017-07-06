const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const {happyExit, captchaMaker} = require('./util')

const {wpThemeDir} = global.const.require('path')
const {assetTypes} = global.commands.require('add/cli/asset/const')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {done, colorlog} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')
const message = global.const.require('messages')

module.exports = db => {
  colorlog('Remove {Asset}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'assets',
        message: 'Select assets you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          if (Object.keys(theme.asset.libs).length > 0) {
            list.push(new inquirer.Separator(' '))
            list.push(new inquirer.Separator('CSS / Javascript'))
            list.push(new inquirer.Separator())
          }

          for (const value in theme.asset.libs) {
            if (Object.prototype.hasOwnProperty.call(theme.asset.libs, value)) {
              let version = ''
              if (theme.asset.libs[value].version) {
                version = `v${theme.asset.libs[value].version}`
              }

              list.push({
                name: `${value}${version}`,
                value: {
                  key: assetTypes.LIB,
                  value
                }
              })
            }
          }

          let sass = []

          for (const type in theme.asset.sass) {
            if (Object.prototype.hasOwnProperty.call(theme.asset.sass, type)) {
              theme.asset.sass[type].forEach(value => {
                sass.push({
                  name: capitalize(`${value} ${type.substr(0, type.length - 1)}`),
                  value: {
                    key: assetTypes.SASS,
                    type,
                    value
                  }
                })
              })
            }
          }

          if (sass.length > 0) {
            sass = [
              new inquirer.Separator(' '),
              new inquirer.Separator('SASS Files'),
              new inquirer.Separator('')
            ].concat(sass)
            list = list.concat(sass)
          }

          let fonts = []

          for (const value in theme.asset.fonts) {
            if (Object.prototype.hasOwnProperty.call(theme.asset.fonts, value)) {
              fonts.push({
                name: `${theme.asset.fonts[value].name} Font`,
                value: {
                  key: assetTypes.FONT,
                  value
                }
              })
            }
          }

          if (fonts.length > 0) {
            fonts = [
              new inquirer.Separator(' '),
              new inquirer.Separator('Web Fonts'),
              new inquirer.Separator('')
            ].concat(fonts)
            list = list.concat(fonts)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({assets}) => assets.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({assets, captcha}) => assets.length > 0 && captcha,
        default: false,
        message: () => 'Removing files or assets from config can\'t be undone. Do you want to continue?'
      }
    ]

    const libTotal = Object.keys(theme.asset.libs).length
    const fontTotal = Object.keys(theme.asset.fonts).length
    let sassTotal = 0
    for (const type in theme.asset.sass) {
      if (Object.prototype.hasOwnProperty.call(theme.asset.sass, type)) {
        sassTotal += theme.asset.sass[type].length
      }
    }
    const assetLength = libTotal + fontTotal + sassTotal

    if (assetLength === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({assets, confirm}) => {
      if (assets.length === 0 || !confirm) {
        happyExit()
      }

      const assetPath = path.join(wpThemeDir, theme.details.slug, 'assets-src')

      assets.forEach(item => {
        switch (item.key) {
          case assetTypes.LIB:
            delete theme.asset.libs[item.value]
            break

          case assetTypes.SASS:
            theme.asset.sass[item.type].forEach(_item => {
              rimraf.sync(path.join(assetPath, 'sass', item.type, `_${_item}.scss`))
            })
            theme.asset.sass[item.type] = theme.asset.sass[item.type].filter(
              _item => _item !== item.value
            )
            break

          case assetTypes.FONT:
            delete theme.asset.fonts[item.value]
            break

          default: break
        }
      })

      saveConfig(db, {
        asset: theme.asset
      }).then(() => {
        done({
          message: message.SUCCEED_REMOVED_ASSET,
          padding: true,
          exit: true
        })
      })
    })
  })
}
