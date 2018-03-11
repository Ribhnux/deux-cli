const program = require('caporal')

program
  .command('dev', 'Run in development mode')
  .option('--build', 'Build asset files.', program.BOOLEAN)
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const DevCLI = global.deuxcmd.require('dev/cli')
    return new DevCLI(options)
  })
