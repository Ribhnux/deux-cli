const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

module.exports = db => {
  colorlog('Remove {Plugins}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select plugins you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in theme.plugins) {
            if (Object.prototype.hasOwnProperty.call(theme.plugins, value)) {
              list.push({
                name: theme.plugins[value].name,
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

    if (Object.keys(theme.plugins).length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({plugins, confirm}) => {
      if (plugins.length === 0 || !confirm) {
        happyExit()
      }

      const pluginPath = path.join(wpThemeDir, theme.details.slug, 'includes', 'plugins')

      Promise.all(plugins.map(
        item => new Promise(resolve => {
          if (theme.plugins[item].init === true) {
            rimraf.sync(path.join(pluginPath, `${item}.php`))
          }
          delete theme.plugins[item]
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          plugins: theme.plugins
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_PLUGIN,
            padding: true,
            exit: true
          })
        })
      })
    })
  })
}
