const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

module.exports = db => {
  colorlog('Remove {Menus}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'menus',
        message: 'Select menus you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in theme.menus) {
            if (Object.prototype.hasOwnProperty.call(theme.menus, value)) {
              list.push({
                name: theme.menus[value].name,
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

    if (Object.keys(theme.menus).length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({menus, confirm}) => {
      if (menus.length === 0 || !confirm) {
        happyExit()
      }

      const libsPath = path.join(wpThemeDir, theme.details.slug, 'includes', 'libraries')

      Promise.all(menus.map(
        item => new Promise(resolve => {
          if (theme.menus[item].walker === true) {
            const libFileName = `class-${item}-menu-nav-walker`
            rimraf.sync(path.join(libsPath, `${libFileName}.php`))
            theme.libraries = theme.libraries.filter(item => item !== libFileName)
          }
          delete theme.menus[item]
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          menus: theme.menus,
          libraries: uniq(theme.libraries)
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_MENU,
            padding: true,
            exit: true
          })
        })
      })
    })
  })
}
