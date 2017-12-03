const path = require('path')
const {createReadStream, createWriteStream} = require('fs')
const {existsSync} = require('fs')
const inquirer = require('inquirer')
const faker = require('faker')
const Listr = require('listr')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const execa = require('execa')
const wpFileHeader = require('wp-get-file-header')
const slugify = require('node-slugify')
const jsonar = require('jsonar')
const {validTags} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const ApiRenderer = global.deuxcli.require('api-renderer')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {capitalize} = global.deuxhelpers.require('util/misc')
const compileFiles = global.deuxhelpers.require('compiler/bulk')

class NewCLI extends CLI {
  constructor(options = {}) {
    super()
    this.init(options, true)
  }

  prepare() {
    this.$title = 'Create {New Theme}'
    this.$prompts = [
      {
        name: 'theme.name',
        message: 'Theme Name',
        default: 'Deux Theme',
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'isChild',
        message: 'Is Child Theme?',
        default: false
      },

      {
        type: 'list',
        name: 'theme.parent',
        message: 'Parent Theme',
        when: ({isChild}) => {
          const themes = this.themeListPath(true)
          return isChild && themes.length > 0
        },
        choices: answers => new Promise((resolve, reject) => {
          const themes = this.themeListPath(true)

          Promise.all(themes.map(
            // Check if theme has style.css, since WP themes should have this file
            themeStyle => new Promise((resolve, reject) => {
              if (existsSync(themeStyle) === true) {
                wpFileHeader(themeStyle).then(info => {
                  const {themeName, textDomain, template} = info

                  // Pick themes that not a child theme
                  if (themeName && answers.theme.name !== themeName && textDomain && !template) {
                    resolve({
                      name: themeName,
                      value: textDomain
                    })
                  } else {
                    resolve({})
                  }
                }).catch(reject)
              } else {
                resolve({})
              }
            })
          )).then(value => {
            resolve(value.filter(item => item.name))
          }).catch(reject)
        })
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
        validate: value => validator(value, {minimum: 2, array: true, var: 'Tags'}),
        filter: value => value.join(', ')
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
        when: answers => new Promise(resolve => {
          const themePath = this.themePath(slugify(answers.theme.name.toLowerCase()))
          resolve(existsSync(themePath))
        })
      },

      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure?'
      }
    ]
  }

  action({theme, overwrite, confirm}) {
    if (!this.$init.apiMode() && !confirm) {
      this.$logger.exit(messages.ERROR_THEME_CREATION_CANCELED)
    }

    const themeNameLower = theme.name.toLowerCase()
    theme.slug = slugify(themeNameLower)
    theme.slugfn = slugify(themeNameLower, {replacement: '_'})
    theme.created = {
      year: new Date().getFullYear()
    }

    const themePath = this.themePath(theme.slug)
    const gitPath = path.join(themePath, '.git')
    const listrOpts = {}

    if (this.$init.apiMode()) {
      listrOpts.renderer = ApiRenderer
    }

    const task = new Listr([
      {
        title: 'Make theme directory',
        enabled: () => overwrite === false || overwrite === undefined,
        task: () => new Listr([
          {
            title: 'Create theme directory',
            task: () => new Promise(resolve => {
              if (existsSync(themePath)) {
                this.$logger.exit(messages.ERROR_THEME_ALREADY_EXISTS)
              }

              mkdirp(themePath, err => {
                if (err) {
                  this.$logger.exit(err)
                }

                resolve()
              })
            })
          },

          {
            title: 'Create .git directory',
            task: () => new Promise(resolve => {
              mkdirp(gitPath, err => {
                if (err) {
                  this.$logger.exit(err)
                }

                resolve()
              })
            })
          }
        ])
      },

      {
        title: 'Overwrite theme directory',
        enabled: () => overwrite,
        task: () => new Listr([
          {
            title: 'Remove all contents',
            task: () => new Promise(resolve => {
              rimraf(path.join(themePath, '*'), err => {
                if (err) {
                  this.$logger.exit(err)
                }

                resolve()
              })
            })
          },

          {
            title: 'Create theme directory',
            task: () => new Promise(resolve => {
              mkdirp(themePath, err => {
                if (err) {
                  this.$logger.exit(err)
                }

                resolve()
              })
            })
          },

          {
            title: 'Remove .git directory',
            task: () => new Promise(resolve => {
              rimraf(gitPath, err => {
                if (err) {
                  this.$logger.exit(err)
                }
                resolve()
              })
            })
          },

          {
            title: 'Create git directory',
            task: () => new Promise(resolve => {
              mkdirp(gitPath, err => {
                if (err) {
                  this.$logger.exit(err)
                }

                resolve()
              })
            })
          }
        ])
      },

      {
        title: 'Init Config',
        task: () => new Promise((resolve, reject) => {
          const phpRegx = /\.php$/g
          const notHiddenFile = item => item && item !== '.gitkeep'

          const components = this.templateSourceList('components')
            .map(item => item.replace(phpRegx, ''))
            .filter(notHiddenFile)

          const themeDetails = Object.assign({}, theme)
          delete themeDetails.repoUrl

          const info = {
            details: themeDetails,
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
            imgsize: {},
            filters: [],
            actions: [],
            libraries: [
              'class-tgm-plugin-activation'
            ],
            helpers: [],
            menus: {},
            widgets: {},
            features: {},
            customizer: {
              /* eslint-disable camelcase */
              panels: {},
              sections: {},
              settings: {},
              control_types: {},
              controls: {}
              /* eslint-enable */
            },
            releases: [
              {
                version: theme.version,
                date: Date.now(),
                changes: [
                  'Initial Release'
                ]
              }
            ]
          }

          try {
            this.addTheme(theme.slug, info)

            if (!this.$db.name) {
              this.setCurrentTheme(theme)
            }

            resolve()
          } catch (err) {
            reject(err)
          }
        })
      },

      {
        title: 'Init WordPress Theme',
        task: () => new Listr([
          {
            title: 'Compiles theme',
            task: () => new Promise((resolve, reject) => {
              const themeInfo = this.themeInfo()
              const releases = themeInfo.releases

              delete themeInfo.details
              delete themeInfo.releases

              const config = jsonar.arrify(themeInfo, {
                prettify: true,
                quote: jsonar.quoteTypes.SINGLE,
                trailingComma: true
              })

              compileFiles({
                srcDir: global.deuxtpl.path,
                dstDir: themePath,
                excludes: [
                  '_partials'
                ],
                rename: {
                  'config.php': `${theme.slug}-config.php`
                },
                syntax: {
                  theme,
                  releases,
                  config
                }
              })

              Promise.all([
                new Promise((resolve, reject) => {
                  mkdirp(this.currentThemePath('assets-src', 'js', 'node_modules'), err => {
                    if (err) {
                      reject(err)
                    }

                    resolve()
                  })
                }),

                new Promise((resolve, reject) => {
                  mkdirp(this.currentThemePath('includes', 'customizers', 'assets-src', 'js', 'node_modules'), err => {
                    if (err) {
                      reject(err)
                    }

                    resolve()
                  })
                })
              ]).then(() => {
                resolve()
              }).catch(reject)
            })
          },

          {
            title: 'Add screenshot',
            task: () => new Promise((resolve, reject) => {
              try {
                createReadStream(this.templateSourcePath('_partials', 'screenshot.png'))
                  .pipe(createWriteStream(this.currentThemePath('screenshot.png')))
                resolve()
              } catch (err) {
                reject(err)
              }
            })
          }
        ])
      },

      {
        title: 'Init Repository',
        task: () => new Listr([
          {
            title: 'Init repository url',
            task: () => execa.stdout('git', [`--git-dir=${gitPath}`, `--work-tree=${gitPath}`, 'init', '-q'])
          },

          {
            title: `Add remote url '${theme.repoUrl}'`,
            task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'remote', 'add', 'origin', theme.repoUrl])
          },

          {
            title: `Validate remote url '${theme.repoUrl}'`,
            task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'pull', 'origin', 'master'])
          },

          {
            title: `Download git objects and refs from '${theme.repoUrl}'`,
            task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'fetch'])
          }
        ])
      }
    ], listrOpts)

    this.$logger.title(`Initializing {${theme.name}}`)

    task.run()
      .then(() => {
        this.$logger.finish(messages.SUCCEED_CREATE_NEW_THEME)
      })
      .catch(err => {
        setTimeout(() => {
          rimraf(themePath, _err => {
            if (_err) {
              this.$logger.exit(_err)
            }

            this.$logger.exit(err)
          })
        }, 1500)
      })
  }
}

module.exports = NewCLI
