const program = require('caporal')

const {commandList} = global.deuxcli.require('fixtures')
const availableCmd = Object.keys(commandList).map(item => commandList[item])

program
  .command('add', 'Add theme functionality')
  .argument('[option]', availableCmd.join(' | '), availableCmd)
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const AddCLI = global.deuxcmd.require('add/cli')
    return new AddCLI(args.option, options)
  })
