const chalk = require('chalk')
const ora = require('ora')
const {msgRegx} = require('./fixtures')

module.exports = (message, color = 'cyan') => {
  const log = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  return ora(log).start()
}
