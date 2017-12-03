const getL10n = require('wp-get-l10n')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveWidget extends CLI {
  constructor(options) {
    super()
    this.themeWidgets = undefined
    this.init(false, options)
  }

  /**
   * Setup remove widgets prompts
   */
  prepare() {
    this.themeWidgets = this.themeInfo('widgets')

    if (Object.keys(this.themeWidgets).length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Widgets}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'widgets',
        message: 'Select widgets you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themeWidgets) {
            if (Object.prototype.hasOwnProperty.call(this.themeWidgets, value)) {
              const name = getL10n(this.themeWidgets[value].name.___$string)

              list.push({
                name,
                value
              })
            }
          }

          if (list.length > 0) {
            list = separatorMaker('Widget List').concat(list)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({widgets}) => widgets.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({widgets, captcha}) => widgets.length > 0 && captcha,
        default: false,
        message: () => 'Removing widgets from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove widgets from config
   * @param {Object} {widgets, confirm}
   */
  action({widgets, confirm}) {
    if (widgets.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(widgets.map(
      item => new Promise(resolve => {
        delete this.themeWidgets[item]
        resolve()
      })
    )).then(() => {
      this.setThemeConfig({
        widgets: this.themeWidgets
      })
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_WIDGET)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveWidget
