const program = require('caporal')

program
  .command('import', 'Import theme from local source or repository')
  .argument('<source>', 'Directory path or Repository URL', program.STRING)
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const ImportCLI = global.deuxcmd.require('import/cli')
    return new ImportCLI(options, args.source)
  })
