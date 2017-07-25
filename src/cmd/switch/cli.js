const {done, exit} = global.helpers.require('logger')
const {setCurrentTheme, getCurrentTheme, getTheme} = global.helpers.require('db/utils')
const message = global.const.require('messages')

const switchTo = (db, themeName) => {
  getCurrentTheme(db).then(currentTheme => {
    if (currentTheme.details.slug === themeName) {
      done({
        message: message.SUCCEED_ALREADY_IN_CURRENT_PROJECT,
        paddingTop: true,
        exit: true
      })
    }

    getTheme(db, themeName).then(({details}) => {
      const {name, slug, version} = details
      setCurrentTheme(db, {name, slug, version}).then(() => {
        done({
          message: message.SUCCEED_THEME_SWITCHED,
          padding: true,
          exit: true
        })
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}

const displayPrompt = db => {
  const {dbTypes} = global.helpers.require('db/const')
  const inquirer = require('inquirer')
  const colorlog = global.helpers.require('logger/colorlog')

  colorlog('Switch to another {theme}')

  const prompts = [
    {
      type: 'list',
      name: 'theme',
      message: 'Select theme',
      choices: () => new Promise(resolve => {
        const themes = db[dbTypes.THEMES]
        const list = []
        for (const value in themes) {
          if (Object.prototype.hasOwnProperty.call(themes, value)) {
            list.push({
              name: themes[value].details.name,
              value
            })
          }
        }
        resolve(list)
      })
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    }
  ]

  inquirer.prompt(prompts).then(answers => {
    if (answers.confirm) {
      switchTo(db, answers.theme)
    }
  }).catch(exit)
}

module.exports = (db, theme) => {
  if (theme) {
    switchTo(db, theme)
  } else {
    displayPrompt(db)
  }
}
