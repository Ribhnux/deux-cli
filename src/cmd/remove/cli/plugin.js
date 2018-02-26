const rimraf = require('rimraf')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemovePlugin extends CLI {
  constructor(options) {
    super()
    this.themePlugins = undefined
    this.init(options)
  }

  /**
   * Setup remove plugin prompts
   */
  prepare() {
    this.themePlugins = this.themeInfo('plugins')

    if (Object.keys(this.themePlugins).length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Plugins}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select plugins you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themePlugins) {
            if (Object.prototype.hasOwnProperty.call(this.themePlugins, value)) {
              list.push({
                name: this.themePlugins[value].name,
                value
              })
            }
          }

          if (list.length > 0) {
            list = separatorMaker('Plugin List').concat(list)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({plugins}) => plugins.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({plugins, captcha}) => plugins.length > 0 && captcha,
        default: false,
        message: () => 'Removing plugins from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove plugins file and config
   *
   * @param {Object} {plugins, confirm}
   */
  action({plugins, confirm}) {
    if (plugins.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(plugins.map(
      item => new Promise(resolve => {
        if (this.themePlugins[item].init === true) {
          rimraf.sync(this.currentThemePath('includes', 'plugins', `${item}.php`))
        }
        delete this.themePlugins[item]
        resolve()
      })
    )).then(() => {
      this.setThemeConfig({
        plugins: this.themePlugins
      })
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_PLUGIN)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemovePlugin
