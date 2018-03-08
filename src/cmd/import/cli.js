const url = require('url')
const {existsSync, statSync} = require('fs')

const CLI = global.deuxcli.require('main')
const validator = global.deuxhelpers.require('util/validator')
const {getGitAuth} = global.deuxhelpers.require('util/misc')

class NewCLI extends CLI {
  constructor(options = {}, source) {
    super()
    this.source = source
    this.init(options, true)
  }

  beforeAction() {
    return new Promise((resolve, reject) => {
      const parsedUrl = url.parse(this.source)
      const isURL = parsedUrl.protocol && parsedUrl.host && parsedUrl.pathname
      const isValidFolder = existsSync(this.source) && statSync(this.source).isDirectory()

      if (isURL || isValidFolder) {
        resolve()
      } else {
        reject(new Error('Invalid Source'))
      }
    })
  }

  /**
   * Import preparation.
   */
  prepare() {
    this.$title = `Import Theme From {${this.source}}`
    this.$prompts = [
      {
        name: 'git.url',
        message: 'Your Repository',
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
        validate: value => validator(value, {min: 3, var: 'Username'})
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
        validate: value => validator(value, {min: 2, var: 'Password'})
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
      }
    ]
  }

  /**
   * Import it.
   */
  action() {

  }
}

module.exports = NewCLI
