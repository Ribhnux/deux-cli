const rimraf = require('rimraf')
const {happyExit, captchaMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveTheme extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup remove widgets prompts
   */
  prepare() {
    this.title = 'Remove {Theme}'
    this.prompts = [
      {
        type: 'list',
        name: 'theme',
        message: 'Select theme you want to remove',
        choices: () => new Promise(resolve => {
          const list = []
          const themes = this.getThemes()

          for (const slug in themes) {
            if (Object.prototype.hasOwnProperty.call(themes, slug)) {
              list.push({
                name: this.getThemes(slug).details.name,
                value: slug
              })
            }
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({theme}) => theme.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({theme, captcha}) => theme.length > 0 && captcha,
        default: false,
        message: () => 'Removing theme is dangerious action and can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove widgets from config
   * @param {Object} {theme, confirm}
   */
  action({theme, confirm}) {
    if (theme.length === 0 || !confirm) {
      happyExit()
    }

    try {
      rimraf(this.themePath(theme), err => {
        if (err) {
          exit(err)
        }

        this.removeTheme(theme)
        finish(messages.SUCCEED_REMOVED_THEME)
      })
    } catch (e) {
      exit(e)
    }
  }
}

module.exports = RemoveTheme
