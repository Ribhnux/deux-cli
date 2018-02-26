const chalk = require('chalk')
const ora = require('ora')
const stripAnsi = require('strip-ansi')
const {msgRegx} = require('./fixtures')

module.exports = (message, color = 'cyan', isRaw = false) => {
  const log = message.replace(msgRegx, `${chalk.bold[color]('$1')}`)
  const loader = ora(log)

  loader.spinner = {
    interval: 70,
    frames: [
      '.  ',
      '.. ',
      ' ..',
      ' ..',
      '  .',
      '   '
    ]
  }

  if (isRaw) {
    const finalMessage = JSON.stringify({
      message: stripAnsi(message)
    })

    return {
      start() {},
      stop() {},
      succeed() {
        console.log(finalMessage)
      },
      fail() {},
      warn() {},
      info() {},
      stopAndPersist() {},
      clear() {},
      render() {},
      frame() {}
    }
  }

  return loader.start()
}
