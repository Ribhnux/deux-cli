const done = require('./done')

module.exports = message => {
  done({
    message,
    padding: true,
    exit: true
  })
}
