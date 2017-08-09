const program = require('caporal')

program
  .command('validate', 'Validates coding standard and markup before releasing theme')
  .argument('[option]', 'Validation option')
  .action(args => {
    const ValidateCLI = global.deuxcmd.require('validate/cli')
    return new ValidateCLI(args.option)
  })
