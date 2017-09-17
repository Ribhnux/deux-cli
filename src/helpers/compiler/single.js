const {writeFileSync, readFileSync} = require('fs')
const handlebars = require('handlebars')
const moment = require('moment')

handlebars.registerHelper('gt', function (a, b) {
  const next = arguments[arguments.length - 1]
  return (a > b) ? next.fn(this) : next.inverse(this)
})

handlebars.registerHelper('reverse', arr => {
  if (Array.isArray(arr) && arr.length > 0) {
    arr.reverse()
  }
})

handlebars.registerHelper('time', time => {
  return moment(new Date(time)).format('YYYY/MM/DD')
})

module.exports = ({srcPath, dstPath, syntax}) => {
  const input = readFileSync(srcPath, 'ascii')
  const compiler = handlebars.compile(input)
  const output = compiler(syntax)
  writeFileSync(dstPath, output, 'utf-8')
}
