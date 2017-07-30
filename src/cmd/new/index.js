const program = require('caporal')

program
  .command('new', 'Create New Theme')
  .action(() => {
    const NewCLI = global.deuxcmd.require('new/cli')
    return new NewCLI()
  })
