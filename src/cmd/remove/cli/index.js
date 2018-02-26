const inquirer = require('inquirer')

const CLI = global.deuxcli.require('main')
const {commandList} = global.deuxcli.require('fixtures')
const messages = global.deuxcli.require('messages')
const {capitalize} = global.deuxhelpers.require('util/misc')

class RemoveCLI extends CLI {
  constructor(subcmd, options) {
    super()
    this.$subcmd = subcmd
    this.$options = options
    this.init(options)
  }

  /**
   * Get remove subcommand list, set directly if subcommand is set
   */
  prepare() {
    if (this.$subcmd) {
      this.initSubCommands(this.$subcmd)
    } else {
      this.$title = 'What you want to {remove} in your theme?'
      this.$prompts = [
        {
          type: 'list',
          name: 'subcmd',
          message: 'Available Options',
          choices: () => new Promise(resolve => {
            const list = Object.keys(commandList).map(key => {
              const value = commandList[key]

              let name
              switch (value) {
                case commandList.LIBCLASS:
                  name = 'Libraries'
                  break

                case commandList.IMGSIZE:
                  name = 'Image Sizes'
                  break

                default:
                  name = capitalize(value) + 's'
                  break
              }
              return {value, name}
            })

            resolve([new inquirer.Separator()].concat(list))
          })
        }
      ]
    }
  }

  /**
   * Init Subcommands directly
   *
   * @param {Object} args
   */
  action({subcmd}) {
    if (!this.$init.apiMode()) {
      this.initSubCommands(subcmd)
    }
  }

  /**
   * The real action is here
   *
   * @param {String} subcmd
   */
  initSubCommands(subcmd) {
    const availableCommand = []

    for (const key in commandList) {
      if (Object.prototype.hasOwnProperty.call(commandList, key)) {
        availableCommand.push(commandList[key])
        if (subcmd === commandList[key]) {
          const SubCommands = global.deuxcmd.require(`remove/cli/${commandList[key]}`)
          return new SubCommands(this.$options)
        }
      }
    }

    if (!availableCommand.includes(subcmd)) {
      this.$logger.exit(new Error(messages.ERROR_INVALID_COMMAND))
    }
  }
}

module.exports = RemoveCLI
