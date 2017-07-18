const stdlog = require('./stdlog')

module.exports = options => {
  stdlog(Object.assign({color: 'green'}, options))
}
