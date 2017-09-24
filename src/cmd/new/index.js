const program = require('caporal')

program
  .command('new', 'Create new theme')
  .action((args, options) => {
    const NewCLI = global.deuxcmd.require('new/cli')
    return new NewCLI(options)
  })
