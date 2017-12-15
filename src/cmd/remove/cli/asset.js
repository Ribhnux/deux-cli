const rimraf = require('rimraf')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {assetTypes} = global.deuxcmd.require('add/cli/asset/fixtures')
const {capitalize} = global.deuxhelpers.require('util/misc')
const compileFile = global.deuxhelpers.require('compiler/single')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveAsset extends CLI {
  constructor(options) {
    super()
    this.themeAsset = undefined
    this.init(options)
  }

  /**
   * Setup remove assets prompts
   */
  prepare() {
    this.themeAsset = this.themeInfo('asset')

    const libTotal = Object.keys(this.themeAsset.libs).length
    const fontTotal = Object.keys(this.themeAsset.fonts).length
    let assetLength = libTotal + fontTotal

    for (const type in this.themeAsset.sass) {
      if (Object.prototype.hasOwnProperty.call(this.themeAsset.sass, type)) {
        assetLength += this.themeAsset.sass[type].length
      }
    }

    if (assetLength === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Assets}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'assets',
        message: 'Select assets you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          if (Object.keys(this.themeAsset.libs).length > 0) {
            list = list.concat(separatorMaker('CSS / Javascript'))
          }

          for (const value in this.themeAsset.libs) {
            if (Object.prototype.hasOwnProperty.call(this.themeAsset.libs, value)) {
              let version = ''
              let semver = value

              if (this.themeAsset.libs[value].version) {
                semver += `@${this.themeAsset.libs[value].version}`
                version = `v${this.themeAsset.libs[value].version}`
              }

              list.push({
                name: `${value} ${version}`,
                value: {
                  key: assetTypes.LIB,
                  semver,
                  value
                }
              })
            }
          }

          let sass = []

          for (const type in this.themeAsset.sass) {
            if (Object.prototype.hasOwnProperty.call(this.themeAsset.sass, type)) {
              this.themeAsset.sass[type].forEach(value => {
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
            sass = separatorMaker('SASS Files').concat(sass)
            list = list.concat(sass)
          }

          let fonts = []

          for (const value in this.themeAsset.fonts) {
            if (Object.prototype.hasOwnProperty.call(this.themeAsset.fonts, value)) {
              fonts.push({
                name: this.themeAsset.fonts[value].name,
                value: {
                  key: assetTypes.FONT,
                  value
                }
              })
            }
          }

          if (fonts.length > 0) {
            fonts = separatorMaker('Web Fonts').concat(fonts)
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
  }

  /**
   * Remove asset file and config
   *
   * @param {Object} {assets, confirm}
   */
  action({assets, confirm}) {
    if (assets.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    const themeDetails = this.themeDetails()

    Promise.all(assets.map(
      item => new Promise(resolve => {
        switch (item.key) {
          case assetTypes.LIB:
            rimraf.sync(this.currentThemePath('assets-src', 'libs', item.semver))
            delete this.themeAsset.libs[item.value]
            break

          case assetTypes.SASS:
            this.themeAsset.sass[item.type].forEach(_item => {
              rimraf.sync(this.currentThemePath('assets-src', 'sass', item.type, `_${_item}.scss`))
            })

            this.themeAsset.sass[item.type] = this.themeAsset.sass[item.type].filter(
              _item => _item !== item.value
            )

            compileFile({
              srcPath: this.templateSourcePath('assets-src', 'sass', 'main.scss'),
              dstPath: this.currentThemePath('assets-src', 'sass', 'main.scss'),
              syntax: {
                sass: {
                  components: this.themeAsset.sass.components.map(item => `'components/${item}'`).join(',\n  '),
                  layouts: this.themeAsset.sass.layouts.map(item => `'layouts/${item}'`).join(',\n  '),
                  pages: this.themeAsset.sass.pages.map(item => `'pages/${item}'`).join(',\n  '),
                  themes: this.themeAsset.sass.themes.map(item => `'themes/${item}'`).join(',\n  '),
                  vendors: this.themeAsset.sass.vendors.map(item => `'vendors/${item}'`).join(',\n  ')
                },
                theme: themeDetails
              }
            })
            break

          case assetTypes.FONT:
            delete this.themeAsset.fonts[item.value]
            break

          default: break
        }

        resolve()
      })
    )).then(() => {
      this.setThemeConfig({
        asset: this.themeAsset
      })
      return true
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_ASSET)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveAsset
