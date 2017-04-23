import inquirer from 'inquirer'
import * as message from '../../lib/messages'
import {error, colorlog} from '../../lib/logger'
import {validAddCommand} from '../../lib/const'
import {capitalize} from '../../lib/utils'
import addHook from './add-hook'
import addAsset from './add-asset'
import addPlugin from './add-plugin'
import addFeature from './add-feature'
import addTemplate from './add-template'
import addComponent from './add-component'

const displayPrompt = cmd => {
  switch (cmd) {
    case validAddCommand.HOOK:
      addHook()
      break

    case validAddCommand.ASSET:
      addAsset()
      break

    case validAddCommand.PLUGIN:
      addPlugin()
      break

    case validAddCommand.FEATURE:
      addFeature()
      break

    case validAddCommand.TEMPLATE:
      addTemplate()
      break

    case validAddCommand.COMPONENT:
      addComponent()
      break

    default:
      // Noop
      break
  }
}

export default args => {
  const prompts = [
    {
      type: 'list',
      name: 'command',
      message: 'Available Options',
      choices: () => new Promise(resolve => {
        const list = []
        Object.keys(validAddCommand).forEach(key => {
          const value = validAddCommand[key]
          const name = capitalize(value)
          list.push({
            value,
            name
          })
        })
        resolve(list)
      })
    }
  ]

  switch (args.length) {
    case 0:
      colorlog('Select what you want to add to {your theme}')
      inquirer.prompt(prompts).then(({command}) => {
        displayPrompt(command)
      })
      break

    case 1:
      displayPrompt(args[0])
      break

    default:
      error({
        message: message.ERROR_INVALID_COMMAND,
        exit: true,
        paddingTop: true
      })
      break
  }
}
