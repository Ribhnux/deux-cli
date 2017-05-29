import inquirer from 'inquirer'
import * as message from '../lib/messages'
import {error, colorlog} from '../lib/logger'
import {capitalize} from '../lib/utils'
import {validAddCommand} from '../lib/const'
import addHook from './hook'
import addAsset from './asset'
import addPlugin from './plugin'
import addFeature from './feature'
import addTemplate from './template'
import addComponent from './component'

const displayPrompt = (db, cmd) => {
  switch (cmd) {
    case validAddCommand.HOOK:
      addHook(db)
      break

    case validAddCommand.ASSET:
      addAsset(db)
      break

    case validAddCommand.PLUGIN:
      addPlugin(db)
      break

    case validAddCommand.FEATURE:
      addFeature(db)
      break

    case validAddCommand.TEMPLATE:
      addTemplate(db)
      break

    case validAddCommand.COMPONENT:
      addComponent(db)
      break

    default:
      error({
        message: message.ERROR_INVALID_COMMAND,
        padding: true,
        exit: true
      })
      break
  }
}

export default (db, args) => {
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
      colorlog('What you want to add in your theme?')
      inquirer.prompt(prompts).then(({command}) => {
        displayPrompt(db, command)
      })
      break

    case 1:
      displayPrompt(db, args[0])
      break

    default:
      error({
        message: message.ERROR_INVALID_COMMAND,
        paddingTop: true,
        exit: true
      })
      break
  }
}
