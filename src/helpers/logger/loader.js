const chalk = require('chalk')
const ora = require('ora')
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
    return {
      start() {},
      stop() {},
      succeed() {},
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
