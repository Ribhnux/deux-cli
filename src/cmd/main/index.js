const program = require('caporal')
const Table = require('cli-table2')
const chalk = require('chalk')
const {colorize} = require('caporal/lib/colorful')

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
  commandTable.push(
    [chalk.magenta(item._name), item._description]
  )
})

customHelp += colorize(commandTable.toString())

program
  .argument('[command]', 'See available commands.')
  .argument('[option]', 'Optional option for each command. type deux [command] --help for more information.')
  .help(customHelp)
  .action(() => {
    const Init = global.deuxcli.require('init')
    const init = new Init()
    init.check()
  })
