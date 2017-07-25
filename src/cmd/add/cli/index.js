const inquirer = require('inquirer')
const {validAddCommand} = require('./const')

const message = global.const.require('messages')
const {colorlog, exit} = global.helpers.require('logger')
const {capitalize} = global.helpers.require('util/misc')

const displayPrompt = (db, cmd) => {
  const availableCommand = []

  for (const key in validAddCommand) {
    if (Object.prototype.hasOwnProperty.call(validAddCommand, key)) {
      availableCommand.push(validAddCommand[key])
      if (cmd === validAddCommand[key]) {
        global.commands.require(`add/cli/${validAddCommand[key]}`)(db)
      }
    }
  }

  if (!availableCommand.includes(cmd)) {
    exit(new Error(message.ERROR_INVALID_COMMAND))
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
    }).catch(exit)
  }
}
