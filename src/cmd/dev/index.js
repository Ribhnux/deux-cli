const program = require('caporal')

const action = () => {
  const init = global.helpers.require('db')
  const cli = global.commands.require('dev/cli')

  init().then(cli).catch(err => {
    throw err
  })
}

program
.command('dev', 'Run in development mode')
.action(action)
