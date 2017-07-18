const chalk = require('chalk')
const {sep, prefix} = require('./const')
const noop = require('./noop')

module.exports = options => {
  const defaultOptions = {
    message: '',
    color: 'red',
    exit: false,
    padding: false,
    paddingTop: false,
    paddingBottom: false
  }

  const {
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

  if (padding) {
    padTop = true
    padBtm = true
  }

  if (padTop && message !== '') {
    noop()
  }

  if (message !== '') {
    console.log(`${colored} ${sep} ${message}`)
  }

  if (padBtm && message !== '') {
    noop()
  }

  if (exit) {
    throw new Error()
  }
}
