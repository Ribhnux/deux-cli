const chalk = require('chalk')
const {sep, prefix} = require('./const')
const blank = require('./blank')

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
    blank()
  }

  if (message !== '') {
    console.log(`${colored} ${sep} ${message}`)
  }

  if (padBtm && message !== '') {
    blank()
  }

  if (exit) {
    /* eslint-disable unicorn/no-process-exit */
    process.exit(1)
    /* eslint-enable */
  }
}
