const chalk = require('chalk')
const format = require('util').format
const prefix = 'deux'
const sep = '>'

exports.error = err => {
  if (err instanceof Error) err = err.message.trim()
  const message = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, message)
  process.exit(1)
}
