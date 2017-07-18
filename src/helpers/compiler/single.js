const {writeFileSync, readFileSync} = require('fs')
const handlebars = require('handlebars')

module.exports = ({srcPath, dstPath, syntax}) => {
  const input = readFileSync(srcPath, 'ascii')
  const compiler = handlebars.compile(input)
  const output = compiler(syntax)
  writeFileSync(dstPath, output, 'utf-8')
}
