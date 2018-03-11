const chalk = require('chalk')
const stripAnsi = require('strip-ansi')
const isObject = require('lodash.isobject')
const {sep, prefix} = require('./fixtures')
const blank = require('./blank')

module.exports = options => {
  const defaultOptions = {
    message: '',
    color: 'red',
    exit: false,
    padding: false,
    paddingTop: false,
    paddingBottom: false,
    isError: false,
    isRaw: false
  }

  const {
    isRaw,
    isError,
    message,
    exit,
    color,
    padding,
    paddingTop,
    paddingBottom
  } = Object.assign(defaultOptions, options)

  const colored = chalk[color](prefix)
  let padTop = paddingTop
  let padBtm = paddingBottom

  if (padding && !isRaw) {
    padTop = true
    padBtm = true
  }

  if (padTop && message !== '' && !isRaw) {
    blank()
  }

  if (message !== '') {
    let finalOutput = `${colored} ${sep} ${message}`

    if (isRaw) {
      if (isObject(message)) {
        finalOutput = message
      } else {
        if (message.message && Array.isArray(message.message)) {
          message.message = message.message.map(stripAnsi).join(' ')
        } else {
          message.message = stripAnsi(message.message)
        }

        finalOutput = message
      }

      finalOutput = JSON.stringify(finalOutput)
    }

    console.log(finalOutput)
  }

  if (padBtm && message !== '' && !isRaw) {
    blank()
  }

  if (exit) {
    /* eslint-disable unicorn/no-process-exit */
    process.exit(isError)
    /* eslint-enable */
  }
}
