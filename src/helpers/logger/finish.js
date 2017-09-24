const done = require('./done')

module.exports = (succeedMsg, isRaw) => {
  let message = succeedMsg

  if (isRaw) {
    message = {
      message: succeedMsg
    }
  }

  done({
    isRaw,
    message,
    padding: true,
    exit: true
  })
}
