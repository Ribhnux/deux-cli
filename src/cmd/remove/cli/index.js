const inquirer = require('inquirer')

const message = global.const.require('messages')
const {validAddCommand} = global.commands.require('add/cli/const')
const {error, colorlog, exit} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')

const displayPrompt = (db, cmd) => {
  switch (cmd) {
    case validAddCommand.HOOK:
      global.commands.require('remove/cli/hooks')(db)
      break

    case validAddCommand.ASSET:
      global.commands.require('remove/cli/asset')(db)
      break

    case validAddCommand.PLUGIN:
      global.commands.require('remove/cli/plugin')(db)
      break

    case validAddCommand.FEATURE:
      global.commands.require('remove/cli/feature')(db)
      break

    case validAddCommand.TEMPLATE:
      global.commands.require('remove/cli/template')(db)
      break

    case validAddCommand.COMPONENT:
      global.commands.require('remove/cli/component')(db)
      break

    case validAddCommand.WIDGET:
      global.commands.require('remove/cli/widget')(db)
      break

    case validAddCommand.MENU:
      global.commands.require('remove/cli/menu')(db)
      break

    case validAddCommand.HELPER:
      global.commands.require('remove/cli/helper')(db)
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
          const name = capitalize(value) + 's'
          return {value, name}
        })
        resolve([new inquirer.Separator()].concat(list))
      })
    }
  ]

  if (option) {
    displayPrompt(db, option)
  } else {
    colorlog('What you want to remove in your theme?')
    inquirer.prompt(prompts).then(({command}) => {
      displayPrompt(db, command)
    }).catch(exit)
  }
}
