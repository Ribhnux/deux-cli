const program = require('caporal')

const action = () => {
  const init = global.helpers.require('db')
  const cli = global.commands.require('new/cli')

  init(true).then(cli).catch(err => {
    throw err
  })
}

program
.command('new', 'Create New Theme')
.action(action)
