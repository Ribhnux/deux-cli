const inquirer = require('inquirer')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done, exit} = global.helpers.require('logger')
const message = global.const.require('messages')

module.exports = db => {
  colorlog('Remove {Widgets}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'widgets',
        message: 'Select widgets you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in theme.widgets) {
            if (Object.prototype.hasOwnProperty.call(theme.widgets, value)) {
              let name = theme.widgets[value].name.string.split(',')
              name = name[0].substr(5, name[0].length - 6)

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

    if (Object.keys(theme.widgets).length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({widgets, confirm}) => {
      if (widgets.length === 0 || !confirm) {
        happyExit()
      }

      Promise.all(widgets.map(
        item => new Promise(resolve => {
          delete theme.widgets[item]
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          widgets: theme.widgets
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_WIDGET,
            padding: true,
            exit: true
          })
        }).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
