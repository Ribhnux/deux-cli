const error = require('./error')

module.exports = err => {
  error({
    message: err.message || err,
    padding: true,
    exit: true
  })
}
