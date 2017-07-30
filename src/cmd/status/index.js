const program = require('caporal')

program
  .command('status', 'Display current theme status')
  .action(() => {
    const StatusCLI = global.deuxcmd.require('status/cli')
    return new StatusCLI()
  })
