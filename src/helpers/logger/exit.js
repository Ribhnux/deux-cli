const error = require('./error')

module.export = err => {
  error({
    message: err.message,
    padding: true,
    exit: true
  })
}
