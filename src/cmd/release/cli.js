const semver = require('semver')
const lastArray = require('lodash.last')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Listr = require('listr')
const execa = require('execa')
const zipdir = require('zip-dir')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const compileFile = global.deuxhelpers.require('compiler/single')
const {
  wpcs,
  themecheck,
  w3Validator,
  stylelint,
  eslint
} = global.deuxcmd.require('test/task')

class ReleaseCLI extends CLI {
  constructor(options) {
    super()
    this.$versions = [
      'patch',
      'minor',
      'major',
      'prepatch',
      'preminor',
      'premajor',
      'prerelease'
    ]
    process.env.EDITOR = 'nano'
    this.options = options
    this.init(options)
  }

  /**
   * Check if version is valid.
   *
   * @param {String} version
   */
  isValidVersion(version) {
    return this.$versions.includes(version) || semver.valid(version)
  }

  /**
   * Get new semver version.
   *
   * @param {String} oldVersion
   * @param {String} input
   */
  getNewVersion(oldVersion, inc, isRaw = false) {
    if (!this.isValidVersion(inc)) {
      throw new Error(`Version should be either ${this.$versions.join(', ')} or a valid semver version.`)
    }

    let newVersion = semver.inc(oldVersion, inc)
    newVersion = newVersion.split('.')
    oldVersion = oldVersion.split('.')

    let firstVersionChange = false
    const output = []

    for (let i = 0; i < newVersion.length; i++) {
      if ((newVersion[i] !== oldVersion[i] && !firstVersionChange)) {
        output.push(isRaw ? newVersion[i] : `${chalk.cyan(newVersion[i])}`)
        firstVersionChange = true
      } else if (newVersion[i].includes('-')) {
        let preVersion = []
        preVersion = newVersion[i].split('-')

        const preVersionStr = `${preVersion[0]}-${preVersion[1]}`
        output.push(isRaw ? preVersionStr : `${chalk.cyan(`${preVersionStr}`)}`)
      } else {
        output.push(isRaw ? newVersion[i] : chalk.reset.dim(newVersion[i]))
      }
    }
    return output.join(isRaw ? '.' : chalk.reset.dim('.'))
  }

  /**
   * Prepare before prompt.
   */
  prepare() {
    const {version: oldVersion} = lastArray(this.themeInfo('releases'))
    this.$title = `Release new version of {${this.themeDetails('name')}}`
    this.$prompts = [
      {
        type: 'list',
        name: 'release.version',
        pageSize: this.$versions.length + 2,
        message: 'Select semver increment or specify new version',
        choices: () => this.$versions.map(version => {
          const newVersion = this.getNewVersion(oldVersion, version)
          const newVersionRaw = this.getNewVersion(oldVersion, version, true)
          return {
            name: `${version} \t${newVersion}`,
            value: newVersionRaw
          }
        }).concat([
          new inquirer.Separator(),
          {
            name: 'Other (specify)',
            value: null
          }
        ])
      },

      {
        name: 'release.customVersion',
        message: 'Custom Version',
        when: ({release}) => !release.version,
        validate: input => {
          if (!semver.valid(input)) {
            return 'Please specify a valid semver, for example, `1.2.3`. See http://semver.org'
          } else if (!semver.gt(input, oldVersion)) {
            return `Version must be greater than ${oldVersion}`
          }

          return true
        }
      },

      {
        name: 'release.changes',
        message: 'Changes log [separated by `.`]',
        default: '',
        filter: input => input.split('.').map(item => item.trim()).filter(item => item)
      },

      {
        type: 'confirm',
        name: 'confirm',
        default: true,
        message: ({release}) => {
          const version = release.version || release.customVersion
          return `Will bump from ${chalk.cyan(oldVersion)} to ${chalk.cyan(version)}. Continue?`
        }
      }
    ]
  }

  action({release, confirm}) {
    if (!confirm) {
      this.$logger.happyExit(messages.CANCEL_RELEASE)
    }

    const newVersion = release.version || release.customVersion
    const stdopts = {cwd: this.currentThemePath()}
    const gitFailCallback = () => {
      const repo = this.themeInfo('repo')
      repo.trylogin = false
      this.setThemeConfig({repo})
    }

    const releases = this.themeInfo('releases')
    const themeDetails = this.themeDetails()

    const task = new Listr([
      {
        title: 'Prerequisite check',
        task: () => new Listr([
          {
            title: 'Check git remote',
            task: () => execa.stdout('git', ['ls-remote', 'origin', 'HEAD'], stdopts)
              .catch(err => {
                gitFailCallback()
                this.$logger.exit(err)
              })
          },

          {
            title: 'Check git tag existence',
            task: () => execa('git', ['fetch'], stdopts)
              .then(() => execa.stdout('git', ['rev-parse', '--quiet', '--verify', `refs/tags/v${newVersion}`], stdopts))
              .then(output => {
                if (output) {
                  this.$logger.exit(`Git tag \`v${newVersion}\` already exists.`)
                }
              }, err => {
                if (err.stdout !== '' || err.stderr !== '') {
                  this.$logger.exit(err)
                }
              })
              .catch(err => {
                gitFailCallback()
                this.$logger.exit(err)
              })
          }
        ])
      },

      {
        title: 'Git check',
        task: () => new Listr([
          {
            title: 'Check current branch',
            task: () => execa.stdout('git', ['symbolic-ref', '--short', 'HEAD'], stdopts)
              .then(branch => {
                if (branch !== 'master') {
                  this.$logger.exit('Release should be on `master` branch.')
                }
              })
          },

          {
            title: 'Check local working tree',
            task: () => execa.stdout('git', ['status', '--porcelain'], stdopts)
              .then(status => {
                if (status !== '') {
                  this.$logger.exit('Unclean working tree. Commit or stash changes first.')
                }
              })
              .catch(err => this.$logger.exit(err))
          },

          {
            title: 'Check remote history',
            task: () => execa.stdout('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD'], stdopts)
              .then(result => {
                if (result !== '0') {
                  this.$logger.exit('Remote history differs. Please pull changes.')
                }
              })
              .catch(err => this.$logger.exit(err))
          }
        ])
      },

      {
        title: 'Running Tests',
        task: () => {
          const testOptions = this.getTestOptions()

          stdopts.maxBuffer = 10 * (1024 * 1024)

          return new Listr([
            {
              title: 'ESLint for Javascript',
              task: () => new Promise((resolve, reject) => {
                eslint(testOptions.js, stdopts)
                  .then(data => resolve(this.getMessage(data)))
                  .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_JS)))
              })
            },

            {
              title: 'Stylelint for SASS',
              task: () => new Promise((resolve, reject) => {
                stylelint(testOptions.sass, stdopts)
                  .then(data => resolve(this.getMessage(data)))
                  .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_SASS)))
              })
            },

            {
              title: 'WordPress Coding Standards',
              task: () => new Promise((resolve, reject) => {
                wpcs(testOptions.wpcs, stdopts)
                  .then(data => resolve(this.getMessage(data)))
                  .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_WPCS)))
              })
            },

            {
              title: 'Theme Check and Theme Mentor',
              task: () => new Promise((resolve, reject) => {
                themecheck(testOptions.themecheck, stdopts)
                  .then(data => resolve(this.getMessage(data)))
                  .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_THEMECHECK)))
              })
            },

            {
              title: 'W3 HTML5 Markup',
              task: () => new Promise((resolve, reject) => {
                w3Validator(testOptions.w3Validator, stdopts)
                  .then(data => resolve(this.getMessage(data)))
                  .catch(err => reject(this.getMessage(err, messages.ERROR_INVALID_W3)))
              })
            }
          ])
        }
      },

      {
        title: 'Bumping version',
        task: () => new Listr([
          {
            title: 'Bump new version to releases database',
            task: () => new Promise(resolve => {
              releases.push({
                version: newVersion,
                date: Date.now(),
                changes: release.changes
              })

              themeDetails.version = newVersion

              this.setThemeConfig({
                releases,
                details: themeDetails
              }, true)

              resolve()
            })
          },

          {
            title: 'Compile theme info',
            task: () => new Promise(resolve => {
              compileFile({
                srcPath: this.templateSourcePath('style.css'),
                dstPath: this.currentThemePath('style.css'),
                syntax: {
                  theme: themeDetails
                }
              })

              resolve()
            })
          },

          {
            title: 'Compile changes log',
            task: () => new Promise(resolve => {
              compileFile({
                srcPath: this.templateSourcePath('_partials', 'changelog.md'),
                dstPath: this.currentThemePath('CHANGELOG.md'),
                syntax: {
                  theme: themeDetails,
                  releases
                }
              })

              resolve()
            })
          }
        ])
      },

      {
        title: 'Release theme',
        task: () => {
          return new Listr([
            {
              title: 'Create archive in `releases` directory',
              task: () => execa.stdout('git', ['archive', '--format', 'zip', '--output', `releases/${themeDetails.slug}-v${newVersion}.zip`, 'master', '--worktree-attributes'], stdopts)
            },

            {
              title: 'Create source archive in `releases` directory',
              enabled: () => this.options.withSrc === true,
              task: () => new Promise(resolve => {
                zipdir(this.currentThemePath(), {
                  saveTo: this.currentThemePath(
                    'releases',
                    `${themeDetails.slug}-src-v${newVersion}.zip`
                  ),
                  filter: filepath => !/\.git|node_modules$/.test(filepath)
                }, err => {
                  if (err) {
                    this.$logger.exit(err)
                  }

                  resolve()
                })
              })
            },

            {
              title: 'Commit changes',
              task: () => execa.stdout('git', ['add', '-A'], stdopts)
                .then(() => execa.stdout('git', ['commit', '-m', `"Release v${newVersion}"`], stdopts))
            },

            {
              title: 'Create tags',
              task: () => execa.stdout('git', ['tag', '-a', `v${newVersion}`, '-m', `"Release v${newVersion}"`], stdopts)
            },

            {
              title: 'Pushing tags',
              task: () => execa.stdout('git', ['push', '--follow-tags'], stdopts).catch(err => {
                gitFailCallback()
                this.$logger.exit(err)
              })
            }
          ])
        }
      }
    ])

    task.run()
      .then(() => {
        this.$logger.finish(messages.SUCCEED_RELEASE)
      })
      .catch(err => this.$logger.exit(err))
  }
}

module.exports = ReleaseCLI
