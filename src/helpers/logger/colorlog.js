const chalk = require('chalk')
const {msgRegx} = require('./const')

module.exports = (message, padding = true, color = 'magenta') => {
  message = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  if (padding) {
    message = `\n${message}\n`
  }
  console.log(message)
}
