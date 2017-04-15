import chalk from 'chalk'

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

  if (padTop) {
    console.log('')
  }

  console.log(`${colored} ${sep} ${message}`)

  if (padBtm) {
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

export const colorlog = (message, padding = true, color = 'magenta') => {
  let finalMsg = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  if (padding) {
    finalMsg = `\n${finalMsg}\n`
  }
  console.log(finalMsg)
}
