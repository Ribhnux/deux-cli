const program = require('caporal')

const {validAddCommand} = global.commands.require('add/cli/const')
const availableCmd = Object.keys(validAddCommand).map(item => validAddCommand[item])

const action = args => {
  const init = global.helpers.require('db')
  const cli = global.commands.require('remove/cli')

  init().then(db => {
    cli(db, args.option)
  }).catch(err => {
    throw err
  })
}

program
.command('remove', 'Remove Assets, Plugins, Templates, Widgets, Menus, Features and Customizer')
.argument('[option]', availableCmd.join(' | '), availableCmd)
.action(action)
