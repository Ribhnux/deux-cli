const chalk = require('chalk')
const format = require('util').format
const prefix = 'deux'
const sep = '>'

exports.error = function (err) {
  if (err instanceof Error) err = err.message.trim()
  const message = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, message)
  process.exit(0)
}


exports.done = function () {
  const message = format.apply(format, arguments)
  console.log(chalk.green(prefix), sep, message)
}
