const program = require('caporal')

const {commandList} = global.deuxcli.require('fixtures')
const availableCmd = Object.keys(commandList).map(item => commandList[item])

program
  .command('remove', 'Remove theme functionality')
  .argument('[option]', availableCmd.join(' | '), availableCmd)
  .action(args => {
    const RemoveCLI = global.deuxcmd.require('remove/cli')
    return new RemoveCLI(args.option)
  })
