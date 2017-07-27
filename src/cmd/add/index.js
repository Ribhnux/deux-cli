const program = require('caporal')

const AddCLI = global.deuxcmd.require('add/cli')
const {commandList} = global.deuxcli.require('fixtures')
const availableCmd = Object.keys(commandList).map(item => commandList[item])

program
  .command('add', 'Add Theme Functionality')
  .argument('[option]', availableCmd.join(' | '), availableCmd)
  .action(args => new AddCLI(args.option))
