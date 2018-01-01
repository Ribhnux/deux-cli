const program = require('caporal')

program
  .command('validate', 'Validates coding standard and markup before releasing theme')
  .argument('[option]', 'Validation option')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const ValidateCLI = global.deuxcmd.require('validate/cli')
    return new ValidateCLI(args.option, options)
  })
