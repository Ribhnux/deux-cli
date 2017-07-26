const program = require('caporal')

const {validCommand} = global.deuxcmd.require('add/cli/const')
const availableCmd = Object.keys(validCommand).map(item => validCommand[item])

program
  .action(args => {
    const AddCLI = global.deuxcmd.require('add/cli')
    new AddCLI(args.option)
  })
  .command('add', 'Add Theme Functionality')
  .argument('[option]', availableCmd.join(' | '), availableCmd)
