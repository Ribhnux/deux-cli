const program = require('caporal')

const action = () => {
  const init = global.helpers.require('db')
  const cli = global.commands.require('status/cli')

  init().then(cli).catch(err => {
    throw err
  })
}

program
.command('status', 'Display current theme status')
.action(action)
