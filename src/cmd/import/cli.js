const url = require('url')
const path = require('path')
const {existsSync, statSync, renameSync} = require('fs')
const chalk = require('chalk')
const intersection = require('lodash.intersection')
const Listr = require('listr')
const wpFileHeader = require('wp-get-file-header')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const ncp = require('ncp')
const execa = require('execa')
const slugify = require('node-slugify')
const arrandel = require('arrandel')
const jsonar = require('jsonar')
const {sourceTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {dirlist, filelist} = global.deuxhelpers.require('util/file')
const {getGitAuth} = global.deuxhelpers.require('util/misc')

// NCP Settings
ncp.limit = 16

class NewCLI extends CLI {
  constructor(options = {}, source) {
    super()
    this.source = source
    this.sourceType = sourceTypes.REPO
    this.themeSlug = null
    this.themeDetails = {}
    this.tmpdir = `tmp-${Date.now()}`
    this.init(options, true)
  }

  beforeAction() {
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(this.source)
      const isURL = parsedUrl.protocol && parsedUrl.host && parsedUrl.pathname
      const isValidFolder = existsSync(this.source) && statSync(this.source).isDirectory()

      let isValidTheme = false
      const validDirList = [
        'assets',
        'assets-src',
        'includes',
        'languages',
        'page-templates',
        'partial-templates'
      ]
      const validFileList = [
        'CHANGELOG.md',
        'README.md',
        'releases.json',
        'style.css'
      ]

      if (isValidFolder) {
        const hasValidDirs = intersection(dirlist(this.source), validDirList).length === validDirList.length
        const hasValidFiles = intersection(filelist(this.source), validFileList).length === validFileList.length

        if (hasValidDirs && hasValidFiles) {
          isValidTheme = true
          this.sourceType = sourceTypes.DIR
        }
      }

      if (isURL || isValidTheme) {
        resolve()
      } else {
        return reject(new Error(messages.ERROR_INVALID_SOURCE))
      }
    })
  }

  /**
   * Import preparation.
   */
  prepare() {
    this.$title = `Import theme from {${this.source}}`
    this.$prompts = [
      {
        name: 'git.source.username',
        message: 'Git Source Username',
        when: () => this.sourceType === sourceTypes.REPO,
        default: () => new Promise(resolve => {
          const {username} = getGitAuth(this.source)
          resolve(username)
        }),
        validate: value => validator(value, {minimum: 3, var: 'Username'})
      },

      {
        type: 'password',
        name: 'git.source.password',
        message: 'Git Source Password',
        when: ({git}) => this.sourceType === sourceTypes.REPO && git.source.username,
        default: () => new Promise(resolve => {
          const {password} = getGitAuth(this.source)
          resolve(password)
        }),
        validate: value => validator(value, {mininum: 2, var: 'Password'})
      },

      {
        name: 'git.url',
        message: 'Your Repository',
        default: () => new Promise(resolve => {
          let url = 'https://github.com/example/my-theme.git'
          if (this.sourceType === sourceTypes.REPO) {
            url = this.source
          }

          resolve(url)
        }),
        validate: value => validator(value, {url: true, git: true, var: `"${value}"`})
      },

      {
        name: 'git.username',
        message: 'Git Username',
        when: ({git}) => git.url !== this.source,
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
        when: ({git}) => git.url !== this.source && git.username,
        default: ({git}) => new Promise(resolve => {
          const {password} = getGitAuth(git.url)
          resolve(password)
        }),
        validate: value => validator(value, {mininum: 2, var: 'Password'})
      },

      {
        type: 'confirm',
        name: 'confirm',
        message: `${chalk.yellow('WARNING: existing directory will be removed')}. Are you sure want to import this theme?`,
        default: true
      }
    ]
  }

  /**
   * Import it.
   */
  action({git, confirm}) {
    if (!this.$init.apiMode() && !confirm) {
      this.$logger.exit(messages.ERROR_THEME_IMPORT_CANCELED)
    }

    const task = new Listr([
      {
        title: 'Copy source files',
        task: () => new Listr([
          {
            title: 'Make temporary directory',
            task: () => new Promise((resolve, reject) => {
              mkdirp(this.themePath(this.tmpdir), err => {
                if (err) {
                  reject(err)
                }

                resolve()
              })
            })
          },

          {
            title: 'Copy files recursively',
            enabled: () => this.sourceType === sourceTypes.DIR,
            task: () => new Promise((resolve, reject) => {
              ncp(this.source, this.themePath(this.tmpdir), err => {
                if (err) {
                  reject(err)
                }

                resolve()
              })
            })
          },

          {
            title: 'Clone Repository',
            enabled: () => this.sourceType === sourceTypes.REPO,
            task: () => new Promise((resolve, reject) => {
              const gitUrlObject = url.parse(this.source)
              gitUrlObject.auth = `${git.source.username}:${git.source.password}`

              const gitUrl = url.format(gitUrlObject)
              execa('git', ['clone', gitUrl, this.themePath(this.tmpdir)])
                .then(() => {
                  resolve()
                })
                .catch(err => {
                  reject(err)
                })
            })
          },

          {
            title: 'Check and validate theme',
            task: () => new Promise((resolve, reject) => {
              const themePath = this.themePath(this.tmpdir)
              const styleCSS = path.join(themePath, 'style.css')

              if (!existsSync(styleCSS)) {
                reject(new Error(messages.ERROR_INVALID_THEME))
              }

              wpFileHeader(styleCSS)
                .then(info => {
                  const {
                    themeName: name,
                    themeUri: uri,
                    textDomain: slug,
                    author,
                    authorUri,
                    description,
                    version,
                    tags
                  } = info
                  const configPath = path.join(themePath, `${slug}-config.php`)

                  if (this.getThemeBySlug(slug)) {
                    this.$logger.exit(messages.ERROR_THEME_ALREADY_EXISTS)
                  }

                  if (!existsSync(configPath)) {
                    reject(new Error(messages.ERROR_CONFIG_NOT_EXISTS))
                  }

                  this.themeSlug = slug
                  this.themeDetails = {
                    name,
                    uri,
                    author,
                    authorUri,
                    description,
                    version,
                    tags,
                    slug,
                    slugfn: slugify(slug, {replacement: '_'}),
                    created: {
                      year: new Date().getFullYear()
                    }
                  }
                  resolve()
                })
                .catch(err => {
                  reject(err)
                })
            })
          },

          {
            title: 'Remove existing theme directory',
            enabled: () => existsSync(this.themePath(this.themeSlug)),
            task: () => new Promise((resolve, reject) => {
              rimraf(this.themePath(this.themeSlug), err => {
                if (err) {
                  reject(err)
                }

                resolve()
              })
            })
          },

          {
            title: `Rename temporary directory to \`${this.themeSlug}\``,
            task: () => new Promise((resolve, reject) => {
              try {
                renameSync(this.themePath(this.tmpdir), this.themePath(this.themeSlug))
                resolve()
              } catch (err) {
                reject(err)
              }
            })
          },

          {
            title: 'Clean existing .git folder',
            task: () => new Promise((resolve, reject) => {
              rimraf(this.themePath([this.themeSlug, '.git']), err => {
                if (err) {
                  reject(err)
                }

                resolve()
              })
            })
          }
        ])
      },

      {
        title: 'Setup Repository',
        task: () => {
          const sourceUrl = this.source === git.url ? this.source : git.url
          const gitUrlObject = url.parse(sourceUrl)
          gitUrlObject.auth = `${git.username || git.source.username}:${git.password || git.source.password}`

          const gitUrl = url.format(gitUrlObject)
          const stdopts = {
            cwd: this.themePath(this.themeSlug)
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
        title: 'Save theme config to database',
        task: () => new Promise((resolve, reject) => {
          const configPath = this.themePath([this.themeSlug, `${this.themeSlug}-config.php`])
          if (!existsSync(configPath)) {
            reject(new Error(messages.ERROR_CONFIG_NOT_EXISTS))
          }

          const phpArray = arrandel(configPath)
          const info = jsonar.parse(phpArray[`${this.themeDetails.slugfn}_config`], {
            emptyRules: this.$emptyRules
          })
          info.$details = this.themeDetails
          info.$repo = {
            credentials: {
              username: git.username,
              password: git.password
            },
            trylogin: true
          }
          info.$releases = require(this.themePath([this.themeSlug, 'releases.json']))
          info.$allowSync = true

          const getSassFiles = structName => {
            return filelist(this.themePath([this.themeSlug, 'assets-src', 'sass', `${structName}s`]))
              .filter(file => path.parse(file).ext === '.sass')
              .map(file => {
                const ext = path.parse(file).ext
                let filename = file.substr(file.length - ext.length, file.length)
                filename = filename.substr(1, filename.length)

                return filename
              })
          }

          info.asset.sass = {
            components: getSassFiles('component'),
            layouts: getSassFiles('layout'),
            pages: getSassFiles('page'),
            themes: getSassFiles('theme'),
            vendors: getSassFiles('vendor')
          }

          this.addTheme(this.themeSlug, info)
          this.setCurrentTheme(this.themeDetails, true)
          resolve()
        })
      }
    ])

    this.$logger.title('Importing theme...')

    task.run()
      .then(() => {
        this.$logger.finish(messages.SUCCEED_IMPORT)
      })
      .catch(err => {
        setTimeout(() => {
          try {
            rimraf.sync(this.themePath(this.tmpdir))
            if (this.themeSlug) {
              rimraf.sync(this.themePath(this.themeSlug))
            }
            this.$logger.exit(err)
          } catch (err) {
            this.$logger.exit(err)
          }
        }, 1500)
      })
  }
}

module.exports = NewCLI
