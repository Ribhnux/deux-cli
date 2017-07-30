const program = require('caporal')

const SwitchCLI = global.deuxcmd.require('switch/cli')

program
  .command('switch', 'Switch to another theme')
  .argument('[theme]', 'Theme Name')
  .action(args => new SwitchCLI(args.theme))
