const program = require('caporal')

const {commandList} = global.deuxcli.require('fixtures')
const availableCmd = Object.keys(commandList).map(item => commandList[item])

program
  .command('add', 'Add theme functionality')
  .argument('[option]', availableCmd.join(' | '), availableCmd)
  .action(args => {
    const AddCLI = global.deuxcmd.require('add/cli')
    return new AddCLI(args.option)
  })
