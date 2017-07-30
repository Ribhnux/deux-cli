const program = require('caporal')

const RemoveCLI = global.deuxcmd.require('remove/cli')
const {commandList} = global.deuxcli.require('fixtures')
const availableCmd = Object.keys(commandList).map(item => commandList[item])

program
.command('remove', 'Remove Theme Functionality')
.argument('[option]', availableCmd.join(' | '), availableCmd)
.action(args => new RemoveCLI(args.option))
