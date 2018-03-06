const program = require('caporal')

program
  .command('sync', 'Synchronize your theme config to deux database')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .action((args, options) => {
    const SyncCLI = global.deuxcmd.require('sync/cli')
    return new SyncCLI(options)
  })
