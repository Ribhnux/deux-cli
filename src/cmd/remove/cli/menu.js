const getL10n = require('wp-get-l10n')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveMenu extends CLI {
  constructor(options) {
    super()
    this.themeMenus = undefined
    this.themeLibraries = undefined
    this.init(false, options)
  }

  /**
   * Setup remove menu prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.themeMenus = themeInfo.menus
    this.themeLibraries = themeInfo.libraries

    if (Object.keys(this.themeMenus).length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Menus}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'menus',
        message: 'Select menus you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themeMenus) {
            if (Object.prototype.hasOwnProperty.call(this.themeMenus, value)) {
              const name = getL10n(this.themeMenus[value].name.___$string)
              list.push({
                name,
                value
              })
            }
          }

          if (list.length > 0) {
            list = separatorMaker('Menu List').concat(list)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({menus}) => menus.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({menus, captcha}) => menus.length > 0 && captcha,
        default: false,
        message: () => 'Removing menus from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove menus walker file and config
   *
   * @param {Object} {menus, confirm}
   */
  action({menus, confirm}) {
    if (menus.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(menus.map(
      item => new Promise(resolve => {
        if (this.themeMenus[item].walker === true) {
          const libFileName = `class-${item}-menu-nav-walker`
          rimraf.sync(this.currentThemePath('includes', 'libraries', `${libFileName}.php`))
          this.themeLibraries = this.themeLibraries.filter(item => item !== libFileName)
        }
        delete this.themeMenus[item]
        resolve()
      })
    )).then(() => {
      this.setThemeConfig({
        menus: this.themeMenus,
        libraries: uniq(this.themeLibraries)
      })
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_MENU)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveMenu
