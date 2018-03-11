const error = require('./error')

module.exports = (err, isRaw) => {
  const errMsg = err.message || err
  let message = errMsg

  if (isRaw) {
    if (typeof err === 'string') {
      message = {
        error: true,
        message: errMsg
      }
    }

    if (typeof err === 'object') {
      message = Object.assign({
        error: true,
        message
      }, err)
    }
  }

  error({
    isRaw,
    message,
    isError: true,
    padding: true,
    exit: true
  })
}
