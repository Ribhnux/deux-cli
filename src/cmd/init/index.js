const program = require('caporal')

const message = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

program
  .argument('[command]', 'See available commands.')
  .argument('[option]', 'Optional option for each command. type deux [command] --help for more information.')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .action((args, options) => {
    const Init = global.deuxcli.require('init')
    const init = new Init(false, options)
    init.check().then(() => {
      finish(message.MORE_INFO, init.apiMode())
    }).catch(exit)
  })
