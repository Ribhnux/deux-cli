const program = require('caporal')

program
  .command('test', 'Validates js, sass, coding standard and markup before releasing theme')
  .argument('[subcmd]', 'Available options are `js`, `sass`, `w3`, `wpcs`, `themecheck`')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const TestCLI = global.deuxcmd.require('test/cli')
    return new TestCLI(args.subcmd, options)
  })
