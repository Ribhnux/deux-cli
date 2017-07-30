const inquirer = require('inquirer')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class SwitchCLI extends CLI {
  constructor(subcmd) {
    super()
    this.subcmd = subcmd
    this.init()
  }

  prepare() {
    if (this.subcmd) {
      this.initSubCommands(this.subcmd)
    } else {
      this.title = 'Switch to {another theme}'
      this.prompts = [
        {
          type: 'list',
          name: 'subcmd',
          message: 'Select theme',
          choices: () => new Promise(resolve => {
            const themes = this.getThemes()
            const list = []
            for (const value in themes) {
              if (Object.prototype.hasOwnProperty.call(themes, value)) {
                list.push({
                  name: this.getThemes(value).details.name,
                  value
                })
              }
            }

            resolve([new inquirer.Separator()].concat(list))
          })
        },

        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure?'
        }
      ]
    }
  }

  /**
   * Init Subcommands directly
   *
   * @param {Object} args
   */
  action({subcmd}) {
    this.initSubCommands(subcmd)
  }

  /**
   * The real action is here
   *
   * @param {String} subcmd
   */
  initSubCommands(subcmd) {
    if (this.themeDetails('slug') === subcmd) {
      finish(messages.SUCCEED_ALREADY_IN_CURRENT_PROJECT)
    } else {
      const theme = this.getThemeBySlug(subcmd)

      Promise.all([
        new Promise(resolve => {
          const {name, slug, version} = theme.details
          this.setCurrentTheme({name, slug, version})
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_THEME_SWITCHED)
      ).catch(exit)
    }
  }
}

module.exports = SwitchCLI