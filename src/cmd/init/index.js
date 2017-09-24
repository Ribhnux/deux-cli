const program = require('caporal')
const Table = require('cli-table2')
const chalk = require('chalk')
const {colorize} = require('caporal/lib/colorful')

const message = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

/* eslint-disable quote-props */
const commandTable = new Table({
  chars: {
    'top': '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    'bottom': '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    'left': '',
    'left-mid': '',
    'mid': '',
    'mid-mid': '',
    'right': '',
    'right-mid': '',
    'middle': ' '
  },
  style: {
    'padding-left': 5,
    'padding-right': 0
  }
})
/* eslint-enable */

let customHelp = chalk.underline.white('Available Commands') + '\n\n'

program.getCommands().forEach(item => {
  const arglist = () => item._args.map(arg => `${arg.name()}`).join(' ')

  commandTable.push(
    [chalk.magenta(item.name()), chalk.gray(arglist()), item.description()]
  )
})

customHelp += colorize(commandTable.toString())

program
  .argument('[command]', 'See available commands.')
  .argument('[option]', 'Optional option for each command. type deux [command] --help for more information.')
  .option('--db <path>', 'Custom database path.', program.STRING)
  .option('--input <json>', 'Set config in API mode without prompts.', program.STRING)
  .option('--api', 'Run in API Mode.', program.BOOLEAN)
  .help(customHelp)
  .action((args, options) => {
    const Init = global.deuxcli.require('init')
    const init = new Init(false, options)
    init.check().then(() => {
      finish(message.MORE_INFO, init.apiMode())
    }).catch(exit)
  })
