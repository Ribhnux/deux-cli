const inquirer = require('inquirer')
const {validAddCommand} = require('./const')

const message = global.const.require('messages')
const {error, colorlog} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')

const displayPrompt = (db, cmd) => {
  switch (cmd) {
    case validAddCommand.HOOK:
      global.commands.require('add/cli/hook')(db)
      break

    case validAddCommand.ASSET:
      global.commands.require('add/cli/asset')(db)
      break

    case validAddCommand.PLUGIN:
      global.commands.require('add/cli/plugin')(db)
      break

    case validAddCommand.FEATURE:
      global.commands.require('add/cli/feature')(db)
      break

    case validAddCommand.TEMPLATE:
      global.commands.require('add/cli/template')(db)
      break

    case validAddCommand.COMPONENT:
      global.commands.require('add/cli/component')(db)
      break

    case validAddCommand.WIDGET:
      global.commands.require('add/cli/widget')(db)
      break

    case validAddCommand.MENU:
      global.commands.require('add/cli/menu')(db)
      break

    case validAddCommand.HELPER:
      global.commands.require('add/cli/helper')(db)
      break

    default:
      error({
        message: message.ERROR_INVALID_COMMAND,
        paddingTop: true,
        exit: true
      })
      break
  }
}

module.exports = (db, option) => {
  const prompts = [
    {
      type: 'list',
      name: 'command',
      message: 'Available Options',
      choices: () => new Promise(resolve => {
        const list = Object.keys(validAddCommand).map(key => {
          const value = validAddCommand[key]
          const name = capitalize(value)
          return {value, name}
        })
        resolve([new inquirer.Separator()].concat(list))
      })
    }
  ]

  if (option) {
    displayPrompt(db, option)
  } else {
    colorlog('What you want to add in your theme?')
    inquirer.prompt(prompts).then(({command}) => {
      displayPrompt(db, command)
    })
  }
}
