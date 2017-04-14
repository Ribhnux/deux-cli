import chalk from 'chalk'
import { format } from 'util'

const prefix = 'deux'
const sep = '>'

export const error = ({ err, exit = true }) => {
  if (err instanceof Error) {
    err = err.message.trim()
  }

  if (err.join) {
    err = err.join(' ')
  }

  console.error(chalk.red(prefix), sep, err)

  if (exit) {
    process.exit(0)
  }
}

export const done = function () {
  const message = format.apply(format, arguments)
  console.log(chalk.green(prefix), sep, message)
}

export const colorlog = message => {
  message = message.replace(/\{(.[^{]*)\}/g, `${chalk.bold.magenta('$1')}`)
  console.log(`\n${message}\n`)
}
