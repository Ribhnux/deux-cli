const program = require('caporal')

const action = args => {
  const init = global.helpers.require('db')
  const cli = global.commands.require('switch/cli')

  init().then(db => {
    cli(db, args.theme)
  }).catch(err => {
    throw err
  })
}

program
.command('switch', 'Switch to another theme')
.argument('[theme]', 'Theme Name')
.action(action)
