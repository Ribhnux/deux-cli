const program = require('caporal')

program
  .command('release', 'Release theme.')
  .option('--with-src', 'Include source codes, in releases directory.', program.BOOLEAN)
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .action((args, options) => {
    const ReleaseCLI = global.deuxcmd.require('release/cli')
    return new ReleaseCLI(options)
  })
