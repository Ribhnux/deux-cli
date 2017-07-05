const inquirer = require('inquirer')

const message = global.const.require('messages')
const {validAddCommand} = global.commands.require('add/cli/const')
const {error, colorlog} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')

const displayPrompt = (db, cmd) => {
  switch (cmd) {
    case validAddCommand.HOOK:
      global.commands.require('remove/hooks')(db)
      break

    case validAddCommand.ASSET:
      global.commands.require('remove/assets')(db)
      break

    case validAddCommand.PLUGIN:
      global.commands.require('remove/plugins')(db)
      break

    case validAddCommand.FEATURE:
      global.commands.require('remove/features')(db)
      break

    case validAddCommand.TEMPLATE:
      global.commands.require('remove/templates')(db)
      break

    case validAddCommand.COMPONENT:
      global.commands.require('remove/components')(db)
      break

    case validAddCommand.WIDGET:
      global.commands.require('remove/widgets')(db)
      break

    case validAddCommand.MENU:
      global.commands.require('remove/menus')(db)
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
    })
  }
}
