const path = require('path')
const {existsSync} = require('fs')
const url = require('url')
const inquirer = require('inquirer')
const faker = require('faker')
const Listr = require('listr')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const execa = require('execa')
const wpFileHeader = require('wp-get-file-header')
const slugify = require('node-slugify')
const jsonar = require('jsonar')
const cpFile = require('cp-file')
const {validTags} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const ApiRenderer = global.deuxcli.require('api-renderer')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {capitalize, getGitAuth} = global.deuxhelpers.require('util/misc')
const compileFiles = global.deuxhelpers.require('compiler/bulk')

class NewCLI extends CLI {
  constructor(options = {}) {
    super()
    this.init(options, true)
  }

  /**
   * Prompts
   */
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
        name: 'git.url',
        message: 'Repository',
        default: 'https://github.com/example/my-theme.git',
        validate: value => validator(value, {url: true, git: true, var: `"${value}"`})
      },

      {
        name: 'git.username',
        message: 'Git Username',
        default: ({git}) => new Promise(resolve => {
          const {username} = getGitAuth(git.url)
          resolve(username)
        }),
        validate: value => validator(value, {minimum: 3, var: 'Username'})
      },

      {
        type: 'password',
        name: 'git.password',
        message: 'Git Password',
        when: ({git}) => git.username,
        default: ({git}) => new Promise(resolve => {
          const {password} = getGitAuth(git.url)
          resolve(password)
        }),
        validate: value => validator(value, {minimum: 2, var: 'Password'})
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
        message: 'Are you sure want to create new theme with this config?'
      }
    ]
  }

  action({theme, git, overwrite, confirm}) {
    if (!this.$init.apiMode() && !confirm) {
      this.$logger.exit(messages.ERROR_THEME_CREATION_CANCELED)
    }

    const themeNameLower = theme.name.toLowerCase()
    const themeSlug = slugify(themeNameLower)
    const themePath = this.themePath(themeSlug)
    const gitPath = path.join(themePath, '.git')
    const listrOpts = {}

    theme.slug = themeSlug
    theme.slugfn = slugify(themeNameLower, {replacement: '_'})
    theme.created = {
      year: new Date().getFullYear()
    }

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
          }
        ])
      },

      {
        title: 'Setup Config',
        task: () => new Promise((resolve, reject) => {
          const phpRegx = /\.php$/g
          const notHiddenFile = item => item && item !== '.gitkeep'

          const components = this.templateSourceList('components')
            .map(item => item.replace(phpRegx, ''))
            .filter(notHiddenFile)

          const themeDetails = Object.assign({}, theme)

          const info = {
            $details: themeDetails,
            $releases: [
              {
                version: theme.version,
                date: Date.now(),
                changes: [
                  'Initial Release'
                ]
              }
            ],
            $repo: {
              credentials: {
                username: git.username,
                password: git.password
              },
              trylogin: false
            },
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
              /* eslint-enable camelcase */
            }
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
        title: 'Setup Repository',
        task: () => {
          const gitUrlObject = url.parse(git.url)
          gitUrlObject.auth = `${git.username}:${git.password}`

          const gitUrl = url.format(gitUrlObject)
          const stdopts = {
            cwd: this.currentThemePath()
          }

          return new Listr([
            {
              title: 'Init repository url',
              task: () => execa.stdout('git', ['init', '-q'], stdopts)
            },

            {
              title: `Add remote url '${git.url}'`,
              task: () => execa.stdout('git', ['remote', 'add', 'origin', gitUrl], stdopts)
            },

            {
              title: `Download git objects and refs from '${git.url}'`,
              task: () => execa.stdout('git', ['fetch'], stdopts)
            },

            {
              title: 'Clean Untracked files',
              task: () => execa.stdout('git', ['clean', '-d', '-f', '-f'], stdopts)
            },

            {
              title: `Pull master branch (if any) from '${git.url}'`,
              task: () => new Promise(resolve => {
                execa.stdout('git', ['pull', 'origin', 'master'], stdopts)
                .then(() => resolve())
                .catch(() => resolve())
              })
            }
          ])
        }
      },

      {
        title: 'Setup WordPress Theme',
        task: () => new Listr([
          {
            title: 'Compiles theme',
            task: () => new Promise((resolve, reject) => {
              const themeInfo = this.themeInfo()
              const releases = themeInfo.$releases

              delete themeInfo.$details
              delete themeInfo.$releases
              delete themeInfo.$repo

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
                  mkdirp(this.currentThemePath('includes', 'customizer', 'assets-src', 'js', 'node_modules'), err => {
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
            task: () => cpFile(
              this.templateSourcePath('_partials', 'screenshot.png'),
              this.currentThemePath('screenshot.png')
            )
          }
        ])
      }
    ], listrOpts)

    this.$logger.title(`Initializing {${theme.name}}`)

    task.run()
      .then(() => {
        const repo = this.themeInfo('$repo')
        repo.trylogin = true
        this.setThemeConfig({repo})
      })
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
