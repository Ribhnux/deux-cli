const done = require('./done')

module.exports = (succeedMsg, isRaw) => {
  let message = succeedMsg

  if (isRaw) {
    if (typeof succeedMsg === 'string') {
      message = {
        message: succeedMsg
      }
    }
  }

  done({
    isRaw,
    message,
    padding: true,
    exit: true
  })
}
