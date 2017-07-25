const error = require('./error')

module.exports = err => {
  error({
    message: err.message,
    padding: true,
    exit: true
  })
}
