const program = require('caporal')

const StatusCLI = global.deuxcmd.require('status/cli')

program
.command('status', 'Display current theme status')
.action(() => new StatusCLI())
