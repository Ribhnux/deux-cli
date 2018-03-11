const rimraf = require('rimraf')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {happyExit, captchaMaker} = global.deuxhelpers.require('util/cli')

class RemoveTheme extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup remove widgets prompts
   */
  prepare() {
    const themelist = []
    const themes = this.getThemes()

    for (const slug in themes) {
      if (Object.prototype.hasOwnProperty.call(themes, slug)) {
        themelist.push({
          name: this.getThemes(slug).details.name,
          value: slug
        })
      }
    }

    if (themelist.length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Theme}'
    this.$prompts = [
      {
        type: 'list',
        name: 'theme',
        message: 'Select theme you want to remove',
        choices: () => themelist
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
    if (theme.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    try {
      rimraf(this.themePath(theme), err => {
        if (err) {
          this.$logger.exit(err)
        }

        this.removeTheme(theme)
        this.$logger.finish(messages.SUCCEED_REMOVED_THEME)
      })
    } catch (err) {
      this.$logger.exit(err)
    }
  }
}

module.exports = RemoveTheme
