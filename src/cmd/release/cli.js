const semver = require('semver')
const lastArray = require('lodash.last')
const chalk = require('chalk')
const inquirer = require('inquirer')
// A const execa = require('execa')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')

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
        output.push(isRaw ? newVersion[i] : `${chalk.bold.cyan(newVersion[i])}`)
        firstVersionChange = true
      } else if (newVersion[i].includes('-')) {
        let preVersion = []
        preVersion = newVersion[i].split('-')

        const preVersionStr = `${preVersion[0]}-${preVersion[1]}`
        output.push(isRaw ? preVersionStr : `${chalk.bold.cyan(`${preVersionStr}`)}`)
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
    this.$title = `Release a new version of {${this.themeDetails('name')}}`
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
        message: 'Changes log',
        default: 'Enter changes separated by .',
        filter: input => input.split('.').map(item => item.trim()).filter(item => item)
      },

      {
        type: 'confirm',
        name: 'confirm',
        default: 'Add your change log split by lines',
        message: ({release}) => {
          const version = release.version || release.customVersion
          return `Will bump from ${chalk.cyan(oldVersion)} to ${chalk.cyan(version)}. Continue?`
        }
      }
    ]
  }

  action({release, confirm}) {
    if (!confirm && !this.$init.apiMode()) {
      this.$logger.happyExit(messages.CANCEL_RELEASE)
    }

    console.log(release)
  }
}

module.exports = ReleaseCLI
