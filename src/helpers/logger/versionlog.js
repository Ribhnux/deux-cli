const chalk = require('chalk')
const program = require('caporal')

module.exports = () => {
  const name = program.name()
  const version = program.version()
  console.log(chalk.bold(`${name} v${version}`))
}
