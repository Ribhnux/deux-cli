const path = require('path')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const faker = require('faker')
const Listr = require('listr')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const execa = require('execa')
const wpFileHeader = require('wp-get-file-header')
const jsonar = require('jsonar')
const slugify = require('node-slugify')
const {validTags} = require('./const')

const {dbTypes} = global.helpers.require('db/const')
const {capitalize} = global.helpers.require('util/misc')
const validator = global.helpers.require('util/validator')
const {dirlist, filelist} = global.helpers.require('util/file')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')
const {error, colorlog} = global.helpers.require('logger')
const compileFiles = global.helpers.require('compiler/bulk')
const {setCurrentTheme, errHandler: dbErrorHandler} = global.helpers.require('db/utils')

module.exports = db => {
  colorlog('Create {New Theme}')

  const prompts = [
    {
      type: 'confirm',
      name: 'isChild',
      message: 'Is Child Theme?',
      default: false
    },

    {
      name: 'theme.name',
      message: 'Theme Name',
      default: 'Deux Theme',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      type: 'list',
      name: 'theme.parent',
      message: 'Parent Theme',
      when: ({isChild}) => isChild,
      choices: answers => {
        const themes = dirlist(wpThemeDir).map(themeDir => {
          const themeStyle = path.join(wpThemeDir, themeDir, 'style.css')

          // Check if theme has style.css, since WP themes should have this file
          return new Promise(resolve => {
            if (existsSync(themeStyle) === true) {
              wpFileHeader(themeStyle).then(info => {
                const {themeName, textDomain, template} = info
                let resolveValue

                // Pick themes that not a child theme
                if (themeName && textDomain && !template) {
                  resolveValue = {
                    name: themeName,
                    value: textDomain
                  }
                }

                resolve(resolveValue)
              })
            } else {
              resolve()
            }
          }).then(info => info)
        })

        return new Promise(resolve => {
          Promise.all(themes).then(themeResult => {
            const validThemes = themeResult.filter(theme => {
              return theme && theme.name !== answers.theme.name
            })
            resolve(validThemes)
          })
        })
      }
    },

    {
      name: 'theme.uri',
      message: 'Theme URI',
      default: 'http://wordpress.org',
      validate: value => validator(value, {url: true, var: `"${value}"`})
    },

    {
      name: 'theme.author',
      message: 'Author',
      default: faker.name.findName(),
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'theme.authorUri',
      message: 'Author URI',
      default: 'http://wordpress.org',
      validate: value => validator(value, {url: true, var: `"${value}"`})
    },

    {
      name: 'theme.description',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      name: 'theme.version',
      message: 'Version',
      default: '1.0.0'
    },

    {
      type: 'checkbox',
      name: 'theme.tags',
      message: 'Tags',
      choices: [
        new inquirer.Separator(),
        ...validTags.map(value => {
          return {
            value,
            name: capitalize(slugify(value, {replacement: ' '}))
          }
        })
      ],
      validate: value => validator(value, {minimum: 2, array: true, var: 'Tags'})
    },

    {
      name: 'theme.repoUrl',
      message: 'Repository',
      default: 'https://github.com/example/my-theme.git',
      validate: value => validator(value, {url: 2, git: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'overwrite',
      message: 'Theme already exists. Overwrite?',
      default: false,
      when: answers => {
        const themePath = path.join(wpThemeDir, slugify(answers.theme.name))
        return existsSync(themePath)
      }
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    }
  ]

  return inquirer
    .prompt(prompts)
    .then(answers => {
      const {theme, overwrite, confirm} = answers

      if (!confirm) {
        error({
          message: message.ERROR_THEME_CREATION_CANCELED,
          paddingTop: true,
          exit: true
        })
      }

      const themeNameLower = theme.name.toLowerCase()
      theme.slug = slugify(themeNameLower)
      theme.slugfn = slugify(themeNameLower, {replacement: '_'})

      const themePath = path.join(wpThemeDir, theme.slug)
      const gitPath = path.join(themePath, '.git')

      colorlog(`Initialize {${theme.name}}`)
      const task = new Listr([
        {
          title: 'Make theme directory',
          enabled: () => overwrite === false || overwrite === undefined,
          task: () => new Promise(resolve => {
            if (existsSync(themePath)) {
              error({
                message: message.ERROR_THEME_ALREADY_EXISTS,
                padding: true,
                exit: true
              })
            }

            mkdirp(themePath, err => {
              if (err) {
                error({
                  message: err.message,
                  padding: true,
                  exit: true
                })
              }

              resolve()
            })
          })
        },

        {
          title: 'Overwrite theme directory',
          enabled: () => overwrite,
          task: () => new Promise(resolve => {
            rimraf(path.join(themePath, '*'), err => {
              if (err) {
                error({
                  message: err.message,
                  padding: true,
                  exit: true
                })
              }

              rimraf(path.join(themePath, '.git'), err => {
                if (err) {
                  error({
                    message: err.message,
                    padding: true,
                    exit: true
                  })
                }
                resolve()
              })
            })
          })
        },

        {
          title: 'Init Config',
          task: () => new Promise((resolve, reject) => {
            const phpRegx = /\.php$/g
            const notHiddenFile = item => item && item !== '.gitkeep'

            const components = filelist(path.join(global.templates.path, 'components'))
              .map(item => item.replace(phpRegx, ''))
              .filter(notHiddenFile)

            const partialTemplates = filelist(path.join(global.templates.path, 'partial-templates'))
              .map(item => item.replace(phpRegx, ''))
              .filter(notHiddenFile)

            const pageTemplates = filelist(path.join(global.templates.path, 'page-templates'))
              .map(item => item.replace(phpRegx, ''))
              .filter(notHiddenFile)

            const themeInfo = {
              details: theme,
              develop: false,
              optimize: true,
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
              components,
              template: {
                pages: pageTemplates,
                partials: partialTemplates
              },
              hook: {
                filters: [],
                actions: []
              },
              utils: [],
              menus: {},
              widgets: {},
              features: {}
            }

            try {
              db[dbTypes.THEMES][theme.slug] = themeInfo
              resolve()
            } catch (err) {
              reject(err)
            }
          })
        },

        {
          title: 'Init WordPress Theme',
          task: () => new Promise(resolve => {
            const themedb = Object.assign({}, db[dbTypes.THEMES][theme.slug])
            delete themedb.details

            const config = jsonar.arrify(themedb, {
              prettify: true,
              quote: jsonar.quoteTypes.SINGLE,
              trailingComma: true
            })
            compileFiles({
              srcDir: global.templates.path,
              dstDir: themePath,
              rename: {
                'config.php': `${theme.slug}-config.php`
              },
              syntax: {
                theme,
                config
              }
            })
            resolve()
          })
        },

        {
          title: 'Init Repository',
          task: () => new Listr([
            {
              title: 'Init git',
              task: () => new Promise((resolve, reject) => {
                mkdirp(gitPath, err => {
                  if (err) {
                    reject(err)
                  }
                  execa.stdout('git', [`--git-dir=${gitPath}`, `--work-tree=${gitPath}`, 'init', '-q'])
                  .then(() => {
                    resolve()
                  })
                  .catch(err => {
                    reject(err)
                  })
                })
              })
            },

            {
              title: `Add remote url \`${theme.repoUrl}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'remote', 'add', 'origin', theme.repoUrl])
            },

            {
              title: `Validate remote url \`${theme.repoUrl}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'pull', 'origin', 'master'])
            },

            {
              title: `Download git objects and refs from \`${theme.repoUrl}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'fetch'])
            }
          ])
        },

        {
          title: `Save ${theme.name} to database`,
          task: () => new Promise(resolve => {
            const {name, slug, version} = theme
            setCurrentTheme(db, {name, slug, version}).then(() => {
              resolve()
            }).catch(dbErrorHandler)
          })
        }
      ])

      task.run().catch(() => {
        setTimeout(() => {
          rimraf(themePath, err => {
            if (err) {
              error({
                message: err.message,
                padding: true,
                exit: true
              })
            }
          })
        }, 1500)
      })
    })
}
