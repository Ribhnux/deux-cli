const error = require('./error')

module.exports = (err, isRaw) => {
  const errMsg = err.message || err
  let message = errMsg

  if (isRaw) {
    message = {
      error: true,
      message: errMsg
    }
  }

  error({
    isRaw,
    isError: true,
    message,
    padding: true,
    exit: true,
  })
}
