const program = require('caporal')

program
  .command('sync', 'Synchronize your theme config to deux database')
  .action(() => {
    const SyncCLI = global.deuxcmd.require('sync/cli')
    return new SyncCLI()
  })
