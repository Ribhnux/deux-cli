const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const cdnjs = require('cdnjs-api')
const faker = require('faker')
const weft = require('weft')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const slugify = require('node-slugify')
const download = require('download')
const uniq = require('lodash.uniq')
const {
  assetTypes,
  libSource,
  fontSource,
  registeredScript,
  sassTypes
} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {capitalize} = global.deuxhelpers.require('util/misc')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddAsset extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup add asset prompts
   */
  prepare() {
    this.$title = 'Add a {New Asset} dependencies'
    this.$prompts = [
      {
        type: 'list',
        name: 'asset.type',
        message: 'Choose asset you want to add',
        choices: [
          {
            name: 'CSS or JS Library',
            value: assetTypes.LIB
          },

          {
            name: 'SASS File',
            value: assetTypes.SASS
          },

          {
            name: 'Web Fonts',
            value: assetTypes.FONT
          }
        ]
      },

      {
        type: 'list',
        name: 'lib.source',
        message: 'Library Source',
        when: ({asset}) => asset.type === assetTypes.LIB,
        choices: [
          {
            name: 'From CDN',
            value: libSource.CDN
          },

          {
            name: 'From WordPress',
            value: libSource.WP
          },

          {
            name: 'Custom URL',
            value: libSource.URL
          }
        ]
      },

      {
        name: 'lib.search',
        message: 'Search Libraries',
        when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.CDN,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        type: 'list',
        name: 'lib.name',
        message: 'Select Library',
        when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.WP,
        choices: () => new Promise(resolve => {
          const list = registeredScript.map(item => {
            const {name, handle, deps} = item
            const value = {handle}
            if (deps) {
              value.deps = deps
            }

            return {
              name,
              value
            }
          })

          list.splice(0, 0, new inquirer.Separator())
          resolve(list)
        })
      },

      {
        type: 'list',
        name: 'lib.name',
        message: 'Select Library',
        when: ({asset, lib}) => {
          return asset.type === assetTypes.LIB && lib.source === libSource.CDN && lib.search.length > 0
        },
        choices: ({lib}) => new Promise((resolve, reject) => {
          const searchLoader = this.$logger.loader(`Searching "${lib.search}" from CDN...`)

          cdnjs.search(lib.search, {fields: {author: true}}).then(result => {
            searchLoader.succeed(`Found ${result.length} item(s)`)

            const choices = result.map(item => {
              let name = item.name
              if (item.author) {
                name += ` by ${(item.author.name || item.author)}`
              }
              return {
                name,
                value: {
                  handle: item.name
                }
              }
            })

            if (choices.length === 0) {
              reject(new Error(messages.ERROR_QUERY_NOT_FOUND))
            }

            choices.splice(0, 0, new inquirer.Separator())

            setTimeout(() => {
              resolve(choices)
            }, 500)
          }).catch(reject)
        })
      },

      {
        type: 'list',
        name: 'lib.version',
        message: 'Select Version',
        when: ({asset, lib}) => {
          return asset.type === assetTypes.LIB && lib.source === libSource.CDN && lib.name.handle
        },
        choices: ({lib}) => new Promise((resolve, reject) => {
          const versionLoader = this.$logger.loader(`Get "${lib.name.handle}" versions...`)

          cdnjs.versions(lib.name.handle).then(result => {
            versionLoader.succeed(`${lib.name.handle} has ${result.length} versions`)

            const choices = result.map(item => {
              return {
                name: `v${item}`,
                value: item
              }
            })
            choices.splice(0, 0, new inquirer.Separator())
            setTimeout(() => {
              resolve(choices)
            }, 500)
          }).catch(reject)
        })
      },

      {
        type: 'checkbox',
        name: 'lib.files',
        message: 'Select Files',
        when: ({asset, lib}) => {
          return asset.type === assetTypes.LIB && lib.source === libSource.CDN && lib.name.handle
        },
        choices: ({lib}) => new Promise((resolve, reject) => {
          const filesLoader = this.$logger.loader(`Fetch "${lib.name.handle}@${lib.version}" files...`)

          cdnjs.files(`${lib.name.handle}@${lib.version}`).then(result => {
            filesLoader.succeed(`Succeed, fetched ${lib.name.handle}@${lib.version} files`)

            const choices = result
              .filter(item => /(\.map)$/.test(item) === false)
              .map(item => {
                return {
                  name: item,
                  value: item
                }
              })
            choices.splice(0, 0, new inquirer.Separator())
            resolve(choices)
          }).catch(reject)
        }),
        validate: value => validator(value, {minimum: 1, array: true, var: 'Files'})
      },

      {
        name: 'lib.name',
        message: 'Library Name',
        when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.URL,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        name: 'lib.version',
        message: 'Library Version',
        when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.URL,
        validate: value => validator(value, {semver: true, var: `"${value}"`})
      },

      {
        name: 'lib.url',
        message: 'Library URL',
        when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.URL,
        validate: value => validator(value, {url: true, var: `"${value}"`})
      },

      {
        name: 'lib.deps',
        message: 'Dependencies (separate with commas)',
        when: ({asset, lib}) => {
          if (asset.type === assetTypes.LIB) {
            const isCDN = lib.source === libSource.CDN && lib.name.handle
            const isURL = lib.source === libSource.URL
            return isCDN || isURL
          }

          return false
        }
      },

      {
        type: 'list',
        name: 'sass.type',
        message: 'Structure Type',
        when: ({asset}) => asset.type === assetTypes.SASS,
        choices: () => new Promise(resolve => {
          const list = []
          for (const i in sassTypes) {
            if (Object.prototype.hasOwnProperty.call(sassTypes, i)) {
              const value = sassTypes[i]
              list.push({
                name: capitalize(value),
                value
              })
            }
          }

          resolve(list)
        })
      },

      {
        name: 'sass.name',
        message: ({sass}) => `${capitalize(sass.type)} Name`,
        when: ({asset}) => asset.type === assetTypes.SASS,
        validate: value => validator(value, {minimum: 3, slug: true, var: 'Name'})
      },

      {
        name: 'sass.description',
        default: faker.lorem.sentence(),
        message: ({sass}) => `${capitalize(sass.type)} Description`,
        when: ({asset}) => asset.type === assetTypes.SASS,
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        name: 'font.api',
        message: 'Please specify Google Fonts API Key',
        when: ({asset}) => asset.type === assetTypes.FONT && !this.getConfig('fontApiKey'),
        validate: value => validator(value, {fontApiKey: true})
      },

      {
        type: 'list',
        name: 'font.source',
        message: 'Choose font source',
        when: ({asset}) => asset.type === assetTypes.FONT,
        choices: [
          {
            name: 'Searching fonts from directory',
            value: fontSource.SEARCH
          },

          {
            name: 'Pick from existing list',
            value: fontSource.LIST
          }
        ]
      },

      {
        name: 'font.search',
        message: 'Font name',
        when: ({asset, font}) => asset.type === assetTypes.FONT && font.source === fontSource.SEARCH,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        type: 'list',
        name: 'font.selected',
        message: 'Select Font',
        when: ({asset, font}) => asset.type === assetTypes.FONT && font.source === fontSource.SEARCH,
        choices: ({font}) => new Promise((resolve, reject) => {
          const apiKey = font.api || this.getConfig('fontApiKey')

          if (!apiKey) {
            this.$logger.exit(messages.ERROR_INVALID_API_KEY)
          }

          const searchOptions = {
            fields: {
              variants: true,
              subsets: true
            }
          }

          const searchLoader = this.$logger.loader(`Searching "${font.search}" from Google Fonts Directory...`)

          weft.apiKey(apiKey)
          weft.search(font.search.toLowerCase(), searchOptions).then(result => {
            searchLoader.succeed(`Found ${result.length} item(s)`)

            const list = []
            if (result.length > 0) {
              result.forEach(item => {
                const {family, variantsFormat, subsets} = item
                list.push({
                  name: family,
                  value: {
                    family,
                    variantsFormat,
                    subsets
                  }
                })
              })
            }
            list.splice(0, 0, new inquirer.Separator())
            resolve(list)
          }).catch(reject)
        })
      },

      {
        type: 'list',
        name: 'font.selected',
        message: 'Font list',
        when: ({asset, font}) => asset.type === assetTypes.FONT && font.source === fontSource.LIST,
        choices: ({font}) => new Promise((resolve, reject) => {
          const apiKey = font.api || this.getConfig('fontApiKey')

          if (!apiKey) {
            this.$logger.exit(messages.ERROR_INVALID_API_KEY)
          }

          const fields = {
            files: false,
            variants: true,
            subsets: true
          }
          const searchLoader = this.$logger.loader('Load list...')

          weft.apiKey(apiKey)
          weft.list(fields).then(result => {
            searchLoader.succeed(`Finished load ${result.length} item(s)`)
            const list = []
            if (result.length > 0) {
              result.forEach(item => {
                const {family, variantsFormat, subsets} = item
                list.push({
                  name: family,
                  value: {
                    family,
                    variantsFormat,
                    subsets
                  }
                })
              })
            }
            list.splice(0, 0, new inquirer.Separator())
            resolve(list)
          }).catch(reject)
        })
      },

      {
        type: 'checkbox',
        name: 'font.variants',
        message: 'Choose Font Variants',
        when: ({asset, font}) => asset.type === assetTypes.FONT && font.selected,
        choices: ({font}) => new Promise(resolve => {
          const list = font.selected.variantsFormat.map(item => {
            return {
              name: item.name,
              value: item
            }
          })
          list.splice(0, 0, new inquirer.Separator())
          resolve(list)
        }),
        validate: value => validator(value, {minimum: 1, array: true, var: 'Font Variants'})
      },

      {
        type: 'checkbox',
        name: 'font.subsets',
        message: 'Choose Font Subsets',
        when: ({asset, font}) => asset.type === assetTypes.FONT && font.selected,
        choices: ({font}) => new Promise(resolve => {
          resolve(font.selected.subsets)
        }),
        validate: value => validator(value, {minimum: 1, array: true, var: 'Font Subsets'})
      },

      {
        type: 'confirm',
        name: 'sass.overwrite',
        message: 'SASS File already exists. Continue to overwrite?',
        default: true,
        when: ({asset, sass}) => new Promise(resolve => {
          if (asset.type !== assetTypes.SASS) {
            resolve(false)
            return
          }

          resolve(
            existsSync(this.currentThemePath('assets-src', 'sass', `${sass.type}s`, `_${sass.name}.scss`))
          )
        })
      }
    ]
  }

  /**
   * Compile assets
   *
   * @param {Object} {asset, lib, sass, font}
   */
  action({asset, lib, sass, font}) {
    const themeDetails = this.themeDetails()
    const theme = this.themeInfo()

    let task = new Promise(resolve => resolve())
    let libname
    let libsemver

    if (asset.type === assetTypes.LIB) {
      libname = lib.name.handle
    }

    // Download Assets
    if (asset.type === assetTypes.LIB && (lib.source === libSource.CDN || lib.source === libSource.URL)) {
      if (lib.source === libSource.URL) {
        libname = slugify(lib.name)
        lib.files = [lib.url]
        delete lib.url
      }

      libsemver = libname

      if (lib.version) {
        libsemver += `@${lib.version}`
      }

      const libpath = this.currentThemePath('assets', 'vendors', libname)
      const downloadLoader = this.$logger.loader('Downloading assets...')

      task = new Promise((resolve, reject) => {
        let files = lib.files

        if (lib.source === libSource.CDN) {
          files = files.map(filepath => {
            return {
              url: cdnjs.url(libsemver, filepath),
              path: path.dirname(filepath)
            }
          })
        }

        rimraf.sync(path.join(libpath, '*'))
        mkdirp.sync(libpath)

        Promise.all(files.map(
          file => new Promise(resolve => {
            const fileUrl = lib.source === libSource.CDN ? file.url : file
            const filePath = lib.source === libSource.CDN ? path.join(libpath, file.path) : libpath

            mkdirp.sync(filePath)
            download(fileUrl, filePath).then(() => {
              resolve()
            }).catch(this.$logger.exit)
          })
        )).then(() => {
          downloadLoader.succeed(`${lib.files.length} file(s) downloaded.`)
          resolve()
        }).catch(err => {
          rimraf.sync(libpath)
          reject(err)
        })
      })
    }

    task.then(() => {
      Promise.all([
        new Promise(resolve => {
          // Save Library
          if (asset.type === assetTypes.LIB) {
            if (lib.source === libSource.WP) {
              lib.deps = lib.name.deps || []
              delete lib.name
            }

            if (lib.source === libSource.CDN || lib.source === libSource.URL) {
              let deps = []
              if (lib.deps.length > 0) {
                deps = lib.deps.split(',').map(item => item.trim())
              }

              lib.files = lib.files.map(file => {
                const ext = path.extname(file)

                /* eslint-disable camelcase */
                const fileObj = {
                  ext: ext.replace('.', ''),
                  path: file,
                  is_active: true,
                  deps: (ext === '.js') ? deps : []
                }
                /* eslint-enable */

                return fileObj
              })
              delete lib.deps

              compileFile({
                srcPath: this.templateSourcePath('_partials', 'sass.scss'),
                dstPath: this.currentThemePath('assets-src', 'sass', 'vendors', `_${libname}.scss`),
                syntax: {
                  sass: {
                    description: libsemver
                  },
                  theme: themeDetails
                }
              })
            }

            theme.asset.libs[libname] = lib
            delete theme.asset.libs[libname].name
          }

          // Save SASS
          if (asset.type === assetTypes.SASS) {
            if (sass.overwrite === false) {
              this.$logger.exit(messages.ERROR_SASS_FILE_ALREADY_EXISTS)
            }

            const structName = `${sass.type}s`

            theme.asset.sass[structName] = uniq(theme.asset.sass[structName].concat(sass.name))
            sass.components = theme.asset.sass.components.map(item => `'components/${item}'`).join(',\n  ')
            sass.layouts = theme.asset.sass.layouts.map(item => `'layouts/${item}'`).join(',\n  ')
            sass.pages = theme.asset.sass.pages.map(item => `'pages/${item}'`).join(',\n  ')
            sass.themes = theme.asset.sass.themes.map(item => `'themes/${item}'`).join(',\n  ')
            sass.vendors = theme.asset.sass.vendors.map(item => `'vendors/${item}'`).join(',\n  ')

            compileFile({
              srcPath: this.templateSourcePath('_partials', 'sass.scss'),
              dstPath: this.currentThemePath('assets-src', 'sass', structName, `_${sass.name}.scss`),
              syntax: {
                sass,
                theme: themeDetails
              }
            })

            compileFile({
              srcPath: this.templateSourcePath('assets-src', 'sass', 'theme.scss'),
              dstPath: this.currentThemePath('assets-src', 'sass', 'theme.scss'),
              syntax: {
                sass,
                theme: themeDetails
              }
            })
          }

          // Save webfonts
          if (asset.type === assetTypes.FONT) {
            const fontName = slugify(font.selected.family)

            theme.asset.fonts[fontName] = {
              name: font.selected.family,
              variants: font.variants.map(item => item.mini.toString()),
              subsets: font.subsets
            }
          }

          resolve()
        }),

        new Promise(resolve => {
          this.setThemeConfig({
            asset: theme.asset
          })
          resolve()
        })
      ]).then(
        this.$logger.finish(messages.SUCCEED_ASSET_ADDED)
      ).catch(this.$logger.exit)
    })
  }
}

module.exports = AddAsset
