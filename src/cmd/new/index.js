const program = require('caporal')

program
  .command('new', 'Create new theme')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const NewCLI = global.deuxcmd.require('new/cli')
    return new NewCLI(options)
  })
