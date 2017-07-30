const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveMenu extends CLI {
  constructor() {
    super()
    this.themeMenus = undefined
    this.themeLibraries = undefined
    this.init()
  }

  /**
   * Setup remove menu prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.themeMenus = themeInfo.menus
    this.themeLibraries = themeInfo.libraries

    if (Object.keys(this.themeMenus).length === 0) {
      happyExit()
    }

    this.title = 'Remove {Menus}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'menus',
        message: 'Select menus you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themeMenus) {
            if (Object.prototype.hasOwnProperty.call(this.themeMenus, value)) {
              list.push({
                name: this.themeMenus[value].name,
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
    if (menus.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(menus.map(
      item => new Promise(resolve => {
        if (this.themeMenus[item].walker === true) {
          const libFileName = `class-${item}-menu-nav-walker`
          rimraf.sync(this.themePath([this.themeDetails('slug'), 'includes', 'libraries', `${libFileName}.php`]))
          this.themeLibraries = this.themeLibraries.filter(item => item !== libFileName)
        }
        delete this.themeMenus[item]
        resolve()
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            menus: this.themeMenus,
            libraries: uniq(this.themeLibraries)
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_MENU)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveMenu
