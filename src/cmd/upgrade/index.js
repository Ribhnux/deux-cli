const program = require('caporal')

program
  .command('upgrade', 'Upgrade assets and plugins')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--list', 'List of upgradable assets or plugins.', program.BOOLEAN)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action(() => {
    const UpgradeCLI = global.deuxcmd.require('upgrade/cli')
    return new UpgradeCLI()
  })
