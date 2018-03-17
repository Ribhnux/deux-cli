const error = require('./error')

module.exports = (err, isRaw) => {
  let errMsg = err.message || err

  if (err.stack) {
    const errorList = err.stack.split(/at/).map(item => item.trim())

    if (errorList.length > 1) {
      errorList.shift()
      errMsg = `${errMsg} \`[${errorList[0]}]\``
    }
  }

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
