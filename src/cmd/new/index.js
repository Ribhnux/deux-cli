const program = require('caporal')
const NewCLI = global.deuxcmd.require('new/cli')

program
  .command('new', 'Create New Theme')
  .action(() => new NewCLI())
