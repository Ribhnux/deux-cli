const program = require('caporal')

program
  .command('switch', 'Switch to another theme')
  .argument('[theme]', 'Theme Name')
  .action(args => {
    const SwitchCLI = global.deuxcmd.require('switch/cli')
    return new SwitchCLI(args.theme)
  })
