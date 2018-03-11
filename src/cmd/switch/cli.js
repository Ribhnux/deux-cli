const inquirer = require('inquirer')
const chalk = require('chalk')

const CLI = global.deuxcli.require('main')
const {colorlog} = global.deuxhelpers.require('logger')
const messages = global.deuxcli.require('messages')

class SwitchCLI extends CLI {
  constructor(subcmd, options) {
    super()
    this.subcmd = subcmd
    this.options = options
    this.availableThemes = null
    this.init(options)
  }

  prepare() {
    if (this.subcmd) {
      this.initSubCommands(this.subcmd)
    } else {
      this.availableThemes = new Promise(resolve => {
        const themes = this.getThemes()
        const list = []

        for (const value in themes) {
          if (Object.prototype.hasOwnProperty.call(themes, value)) {
            const {name, description, version} = this.getThemes(value).$details
            list.push({
              name,
              description,
              version,
              value
            })
          }
        }

        resolve(list)
      })

      this.$title = this.options.list ? '{Theme List}' : 'Switch to {another theme}'
      this.$prompts = this.options.list ? [] : [
        {
          type: 'list',
          name: 'subcmd',
          message: 'Select theme',
          choices: () => new Promise(resolve => {
            this.availableThemes.then(list => {
              resolve([new inquirer.Separator()].concat(list))
            })
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
  action(prompts) {
    if (this.options.list) {
      this.availableThemes.then(list => {
        if (this.$init.apiMode()) {
          this.$logger.finish(list)
        }

        const prettyList = list.map(item => {
          return `${chalk.bold.cyan(item.name)} ${chalk.gray(`v${item.version}`)}\n${item.description}`
        }).join('\n\n')

        colorlog(`\n${prettyList}\n`, false)
      })
    } else {
      this.initSubCommands(prompts.subcmd)
    }
  }

  /**
   * The real action is here
   *
   * @param {String} subcmd
   */
  initSubCommands(subcmd) {
    if (this.themeDetails('slug') === subcmd) {
      this.$logger.finish(messages.SUCCEED_ALREADY_IN_CURRENT_PROJECT)
    } else {
      const theme = this.getThemeBySlug(subcmd)

      Promise.all([
        new Promise(resolve => {
          const {name, slug, version} = theme.$details
          this.setCurrentTheme({name, slug, version})
          resolve()
        })
      ]).then(
        this.$logger.finish(messages.SUCCEED_THEME_SWITCHED)
      ).catch(this.$logger.exit)
    }
  }
}

module.exports = SwitchCLI
