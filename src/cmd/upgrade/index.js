const program = require('caporal')

program
  .command('upgrade', 'Upgrade assets from CDN and plugin dependencies')
  .action(() => {
    const UpgradeCLI = global.deuxcmd.require('upgrade/cli')
    return new UpgradeCLI()
  })
