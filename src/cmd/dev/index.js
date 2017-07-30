const program = require('caporal')

program
  .command('dev', 'Run in development mode')
  .action(() => {
    const DevCLI = global.deuxcmd.require('dev/cli')
    return new DevCLI()
  })
