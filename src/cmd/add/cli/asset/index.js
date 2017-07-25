const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const cdnjs = require('cdnjs-api')
const download = require('download')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const slugify = require('node-slugify')
const faker = require('faker')
const weft = require('weft')
const {assetTypes, sassTypes, libSource, registeredScript, fontSource} = require('./const')

const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')
const compileFile = global.helpers.require('compiler/single')
const {colorlog, error, done, loader, exit} = global.helpers.require('logger')
const {getEnv, getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const {capitalize} = global.helpers.require('util/misc')

module.exports = db => {
  colorlog('Add a {New Asset} dependencies')

  const prompts = [
    {
      type: 'list',
      name: 'asset.type',
      message: 'What you want to add?',
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
        const searchLoader = loader(`Searching "${lib.search}" from CDN...`)

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
            reject(new Error(message.ERROR_QUERY_NOT_FOUND))
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
        const versionLoader = loader(`Get "${lib.name.handle}" versions...`)

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
        const filesLoader = loader(`Fetch "${lib.name.handle}@${lib.version}" files...`)

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
      name: 'lib.deps',
      message: 'Dependencies (separate with commas)',
      when: ({asset, lib}) => asset.type === assetTypes.LIB && lib.source === libSource.CDN && lib.name.handle
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
      when: ({asset}) => asset.type === assetTypes.FONT && !getEnv(db).fontApiKey,
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
        const apiKey = font.api || getEnv(db).fontApiKey

        if (!apiKey) {
          error({
            message: message.ERROR_INVALID_API_KEY,
            padding: true,
            exit: true
          })
        }

        const searchOptions = {
          fields: {
            variants: true,
            subsets: true
          }
        }

        const searchLoader = loader(`Searching "${font.search}" from Google Fonts Directory...`)

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
        const apiKey = font.api || getEnv(db).fontApiKey

        if (!apiKey) {
          error({
            message: message.ERROR_INVALID_API_KEY,
            padding: true,
            exit: true
          })
        }

        const fields = {
          files: false,
          variants: true,
          subsets: true
        }
        const searchLoader = loader('Load list...')

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
      when: ({asset, sass}) => new Promise((resolve, reject) => {
        if (asset.type !== assetTypes.SASS) {
          resolve(false)
          return
        }

        getCurrentTheme(db).then(theme => {
          const sassPath = path.join(wpThemeDir, theme.details.slug, 'assets-src', 'sass', `${sass.type}s`, `_${sass.name}.scss`)
          resolve(existsSync(sassPath))
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({asset, lib, sass, font}) => {
    getCurrentTheme(db).then(theme => {
      const assetPath = path.join(wpThemeDir, theme.details.slug, 'assets-src')
      let task = new Promise(resolve => resolve())

      // Download Assets
      if (asset.type === assetTypes.LIB && lib.source === libSource.CDN) {
        const libsemver = `${lib.name.handle}@${lib.version}`
        const libpath = path.join(assetPath, 'libs', libsemver)
        const downloadLoader = loader('Downloading assets...')

        task = new Promise((resolve, reject) => {
          rimraf(path.join(libpath, '*'), err => {
            if (err) {
              throw err
            }

            mkdirp(libpath, err => {
              if (err) {
                throw err
              }

              Promise.all(cdnjs.url(libsemver, lib.files).map(
                filename => download(filename, libpath)
              )).then(() => {
                downloadLoader.succeed(`${lib.files.length} file(s) downloaded.`)
                resolve()
              }).catch(reject)
            })
          })
        })
      }

      task.then(() => {
        // Save Library
        if (asset.type === assetTypes.LIB) {
          if (lib.source === libSource.WP) {
            lib.deps = lib.name.deps
          }

          if (lib.source === libSource.CDN) {
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
          }

          theme.asset.libs[lib.name.handle] = lib
          delete theme.asset.libs[lib.name.handle].name
        }

        // Save SASS
        if (asset.type === assetTypes.SASS) {
          if (sass.overwrite === false) {
            error({
              message: message.ERROR_SASS_FILE_ALREADY_EXISTS,
              padding: true,
              exit: true
            })
          }

          const structName = `${sass.type}s`
          const sassPath = path.join(assetPath, 'sass', structName, `_${sass.name}.scss`)

          sass.components = theme.asset.sass.components.map(item => `'components/${item}'`).join(',\n  ')
          sass.layouts = theme.asset.sass.layouts.map(item => `'layouts/${item}'`).join(',\n  ')
          sass.pages = theme.asset.sass.pages.map(item => `'pages/${item}'`).join(',\n  ')
          sass.themes = theme.asset.sass.themes.map(item => `'themes/${item}'`).join(',\n  ')
          sass.vendors = theme.asset.sass.vendors.map(item => `'vendors/${item}'`).join(',\n  ')

          compileFile({
            srcPath: path.join(global.templates.path, '_partials', 'sass.scss'),
            dstPath: sassPath,
            syntax: {
              sass,
              theme
            }
          })

          compileFile({
            srcPath: path.join(global.templates.path, 'assets-src', 'sass', 'main.scss'),
            dstPath: path.join(assetPath, 'sass', 'main.scss'),
            syntax: {
              sass,
              theme
            }
          })

          theme.asset.sass[structName] = theme.asset.sass[structName].concat(sass.name)
        }

        // Save webfonts
        if (asset.type === assetTypes.FONT) {
          const safeFontFamily = font.selected.family.replace(/\s/g, '+')
          const fontName = slugify(font.selected.family)
          const fontVariants = font.variants.map(item => item.mini).join(',')

          theme.asset.fonts[fontName] = {
            name: font.selected.family,
            variants: font.variants.map(item => item.name),
            subsets: font.subsets,
            url: weft.embedUrl(safeFontFamily, fontVariants, font.subsets.join(','))
          }
        }

        saveConfig(db, {
          asset: theme.asset
        }).then(() => {
          done({
            message: message.SUCCEED_ASSET_ADDED,
            padding: true,
            exit: true
          })
        }).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
