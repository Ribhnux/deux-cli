const program = require('caporal')

program
  .command('switch', 'Switch to another theme')
  .argument('[theme]', 'Theme Name')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--list', 'List of available starter theme built with deux.', program.BOOLEAN)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const SwitchCLI = global.deuxcmd.require('switch/cli')
    return new SwitchCLI(args.theme, options)
  })
