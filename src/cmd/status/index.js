const program = require('caporal')

program
  .command('status', 'Display current theme status')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const StatusCLI = global.deuxcmd.require('status/cli')
    return new StatusCLI(options)
  })
