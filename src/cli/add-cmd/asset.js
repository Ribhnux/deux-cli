// Font API
// https://developers.google.com/fonts/docs/developer_api

import path from 'path'
import {existsSync} from 'fs'
import inquirer from 'inquirer'
import cdnjs from 'cdnjs-api'
import download from 'download'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import faker from 'faker'
import _s from 'string'
import * as message from '../lib/messages'
import validator from '../lib/validator'
import {compileFile} from '../lib/utils'
import {colorlog, error, done, loader} from '../lib/logger'
import {assetType, scssType, assetSource, registeredScript, wpThemeDir, templateDir} from '../lib/const'
import {dbErrorHandler, getCurrentTheme, saveConfig} from '../lib/db-utils'

export default db => {
  colorlog(`Add a {New Asset} dependencies`)

  const prompts = [
    {
      type: 'list',
      name: 'asset.type',
      message: 'What you want to add?',
      choices: [
        {
          name: 'CSS or JS Library',
          value: assetType.LIB
        },

        {
          name: 'Sassy CSS',
          value: assetType.SCSS
        },

        {
          name: 'Web Fonts',
          value: assetType.FONT
        }
      ]
    },

    {
      type: 'list',
      name: 'asset.source',
      message: 'Library Source',
      when: ({asset}) => asset.type === assetType.LIB,
      choices: [
        {
          name: 'From CDN',
          value: assetSource.CDN
        },

        {
          name: 'From WordPress',
          value: assetSource.WP
        }
      ]
    },

    {
      name: 'asset.search',
      message: 'Search Libraries',
      when: ({asset}) => asset.source === assetSource.CDN,
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      type: 'list',
      name: 'lib.name',
      message: 'Select Library',
      when: ({asset}) => asset.source === assetSource.WP,
      choices: () => new Promise(resolve => {
        resolve(registeredScript.map(item => {
          const {name, handle, deps} = item
          const value = {handle}
          if (deps) {
            value.deps = deps
          }

          return {
            name,
            value
          }
        }))
      })
    },

    {
      type: 'list',
      name: 'lib.name',
      message: 'Select Library',
      when: ({asset}) => asset.source === assetSource.CDN && asset.search.length > 0,
      choices: ({asset}) => new Promise((resolve, reject) => {
        const searchLoader = loader(`Searching "${asset.search}" from CDN...`)
        cdnjs.search(asset.search, {fields: {author: true}}).then(result => {
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
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      })
    },

    {
      type: 'list',
      name: 'lib.version',
      message: 'Select Version',
      when: ({asset, lib}) => asset.source === assetSource.CDN && lib.name.handle,
      choices: ({lib}) => new Promise((resolve, reject) => {
        cdnjs.versions(lib.name.handle).then(result => {
          const choices = result.map(item => {
            return {
              name: `v${item}`,
              value: item
            }
          })
          choices.splice(0, 0, new inquirer.Separator())
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      })
    },

    {
      type: 'checkbox',
      name: 'lib.files',
      message: 'Select Files',
      when: ({asset, lib}) => asset.source === assetSource.CDN && lib.name.handle,
      choices: ({lib}) => new Promise((resolve, reject) => {
        cdnjs.files(`${lib.name.handle}@${lib.version}`).then(result => {
          const choices = result.map(item => {
            return {
              name: item,
              value: item
            }
          })
          choices.splice(0, 0, new inquirer.Separator())
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      }),
      validate: value => validator(value, {minimum: 1, array: true, var: 'Files'})
    },

    {
      name: 'lib.deps',
      message: 'Dependencies (separate with commas)',
      when: ({asset, lib}) => asset.source === assetSource.CDN && lib.name.handle
    },

    {
      type: 'list',
      name: 'scss.type',
      message: 'Structure Type',
      when: ({asset}) => asset.type === assetType.SCSS,
      choices: () => new Promise(resolve => {
        const choices = []
        for (const i in scssType) {
          if (Object.prototype.hasOwnProperty.call(scssType, i)) {
            const value = scssType[i]
            choices.push({
              name: _s(value).capitalize().s,
              value
            })
          }
        }

        resolve(choices)
      })
    },

    {
      name: 'scss.name',
      message: ({scss}) => `${_s(scss.type).capitalize().s} Name`,
      when: ({asset}) => asset.type === assetType.SCSS,
      validate: value => validator(value, {minimum: 3, slug: true, var: 'Name'})
    },

    {
      name: 'scss.desc',
      default: faker.lorem.sentence(),
      message: ({scss}) => `${_s(scss.type).capitalize().s} Description`,
      when: ({asset}) => asset.type === assetType.SCSS,
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]

  return inquirer.prompt(prompts).then(({asset, lib, scss}) => {
    getCurrentTheme(db).then(({docId, textDomain}) => {
      let task = new Promise(resolve => resolve())

      // Download Assets
      if (asset.type === assetType.LIB && asset.source === assetSource.CDN) {
        const assetPath = path.join(wpThemeDir, textDomain, 'assets', 'src', 'libs')
        const libsemver = `${lib.name.handle}@${lib.version}`
        const libpath = path.join(assetPath, libsemver)
        const downloaderMap = filename => download(filename, libpath)

        task = new Promise((resolve, reject) => {
          const downloadLoader = loader('Downloading assets...')
          rimraf(path.join(libpath, '*'), err => {
            if (err) {
              throw err
            }

            mkdirp(libpath, err => {
              if (err) {
                throw err
              }

              Promise.all(cdnjs.url(libsemver, lib.files).map(downloaderMap)).then(() => {
                downloadLoader.succeed(`${lib.files.length} file(s) downloaded.`)
                resolve()
              }).catch(err => {
                reject(err)
              })
            })
          })
        })
      }

      task.then(() => {
        db.upsert(docId, doc => {
          let library
          let scssKey
          let scssPath
          let scssComponents
          let scssLayouts
          let scssPages
          let scssThemes
          let scssVendors

          switch (asset.type) {
            case assetType.LIB:
              library = {source: lib.source}

              if (!doc.asset.libs[lib.name.handle]) {
                doc.asset.libs[lib.name.handle] = {}
              }

              if (asset.source === assetSource.WP) {
                library.deps = lib.name.deps
              }

              if (asset.source === assetSource.CDN) {
                library.version = lib.version
                library.files = lib.files.map(file => {
                  const deps = lib.deps.length > 0 ? lib.deps.split(',') : []
                  const ext = path.extname(file).replace('.', '')
                  const basename = path.basename(file, `.${ext}`).replace(/\./g, '-')
                  const handle = _s(basename).slugify().s

                  return {
                    ext,
                    handle,
                    deps,
                    path: file
                  }
                })
              }

              doc.asset.libs[lib.name.handle] = library
              break

            case assetType.SCSS:
              scssKey = `${scss.type}s`
              scssPath = path.join(
                wpThemeDir, textDomain, 'assets', 'src', 'scss', scssKey, `_${scss.name}.scss`
              )

              if (existsSync(scssPath)) {
                error({
                  message: message.ERROR_SASS_FILE_ALREADY_EXISTS,
                  padding: true,
                  exit: true
                })
              }

              doc.asset.scss[scssKey].push(scss.name)

              compileFile({
                srcPath: path.join(templateDir, '_partials', 'sass.scss'),
                dstPath: scssPath,
                syntax: {
                  scssDescription: scss.desc
                }
              })

              scssComponents = doc.asset.scss.components.map(item => `'components/${item}'`).join(',\n  ')
              scssLayouts = doc.asset.scss.layouts.map(item => `'layouts/${item}'`).join(',\n  ')
              scssPages = doc.asset.scss.pages.map(item => `'pages/${item}'`).join(',\n  ')
              scssThemes = doc.asset.scss.themes.map(item => `'themes/${item}'`).join(',\n  ')
              scssVendors = doc.asset.scss.vendors.map(item => `'vendors/${item}'`).join(',\n  ')

              compileFile({
                srcPath: path.join(templateDir, 'assets', 'src', 'scss', 'main.scss'),
                dstPath: path.join(wpThemeDir, textDomain, 'assets', 'src', 'scss', 'main.scss'),
                syntax: {
                  scssComponents,
                  scssLayouts,
                  scssPages,
                  scssThemes,
                  scssVendors
                }
              })
              break

            default:
              // Noop
              break
          }

          return doc
        }).then(() => {
          saveConfig(db, docId).then(() => {
            done({
              message: message.SUCCEED_PLUGIN_ADDED,
              paddingTop: true,
              exit: true
            })
          })
        }).catch(dbErrorHandler)
      })
    }).catch(dbErrorHandler)
  })
}
