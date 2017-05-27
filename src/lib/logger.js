import chalk from 'chalk'
import ora from 'ora'

const prefix = 'deux'
const sep = '>'
const msgRegx = /\{(.[^{]*)\}/g

export const stdlog = options => {
  const {
    message,
    exit,
    color,
    padding,
    paddingTop,
    paddingBottom
  } = Object.assign({
    message: '',
    color: 'red',
    exit: false,
    padding: false,
    paddingTop: false,
    paddingBottom: false
  }, options)

  const colored = chalk[color](prefix)

  let padTop = paddingTop
  let padBtm = paddingBottom
  if (padding) {
    padTop = true
    padBtm = true
  }

  if (padTop && message !== '') {
    console.log('')
  }

  if (message !== '') {
    console.log(`${colored} ${sep} ${message}`)
  }

  if (padBtm && message !== '') {
    console.log('')
  }

  if (exit) {
    throw new Error()
  }
}

export const error = options => {
  stdlog(options)
}

export const done = options => {
  stdlog(Object.assign({color: 'green'}, options))
}

export const colorlog = (message, padding = true, color = 'magenta') => {
  let finalMsg = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  if (padding) {
    finalMsg = `\n${finalMsg}\n`
  }
  console.log(finalMsg)
}

export const loader = (message, color = 'cyan') => {
  const finalMsg = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  const spinner = ora(finalMsg).start()
  console.log('')
  return spinner
}
