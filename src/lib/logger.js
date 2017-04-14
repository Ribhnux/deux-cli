import chalk from 'chalk'

const prefix = 'deux'
const sep = '>'
const msgRegx = /\{(.[^{]*)\}/g

export const stdlog = options => {
  const {message, exit, color, paddingTop, paddingBottom} = Object.assign({
    message: '',
    color: 'red',
    exit: false,
    paddingTop: false,
    paddingBottom: false
  }, options)

  const colored = chalk[color](prefix)

  if (paddingTop) {
    console.log('')
  }

  console.log(`${colored} ${sep} ${message}`)

  if (paddingBottom) {
    console.log('')
  }

  if (exit) {
    throw new Error(undefined)
  }
}

export const error = options => {
  stdlog(options)
}

export const done = options => {
  stdlog(Object.assign({color: 'green'}, options))
}

export const colorlog = message => {
  message = message.replace(msgRegx, `${chalk.bold.magenta('$1')}`)
  console.log(`\n${message}\n`)
}
