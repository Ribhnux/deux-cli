import inquirer from 'inquirer'
import {error, colorlog} from '../../lib/logger'
import * as message from '../../lib/messages'
import * as constant from '../../lib/const'

const addPlugin = options => {
  colorlog('Add {plugin} dependencies')

  const prompts = [
    {
      type: 'list',
      name: 'location',
      message: 'Plugin source',
      choices: [
        {
          name: 'WordPress.org',
          value: 'wordpress'
        },
        {
          name: 'Private Repo',
          value: 'private'
        }
      ]
    },
    {
      type: 'text',
      name: 'search',
      message: 'Search Slug',
      when: ({location}) => {
        return location === 'wordpress'
      }
    },
    {
      type: 'text',
      name: 'url',
      message: 'Plugin URL',
      hint: '.zip extension',
      when: ({location}) => {
        return location === 'private'
      },
      validate: value => {
        if (value.substr(value.length, -4) !== '.zip') {
          return message.ERROR_REPOSITORY_URL_NOT_ZIP
        }
        return true
      }
    }
  ]

  return inquirer
    .prompt(prompts)
    .then(answers => Object.assign({}, options, answers))
}

const addAsset = ext => {
  colorlog(`Add {${ext}} asset`)
}

const addSCSS = () => {
  colorlog('Add new {SCSS}')
}

const addTemplate = () => {
  colorlog('Add {page template}')
}

const addLoopTemplate = () => {
  colorlog('Add {loop template}')
}

const addComponent = () => {
  colorlog('Add {component template}')
}

const addHook = name => {
  colorlog(`Add {${name} function}`)
}

export default args => {
  const hasLength = args.length && args.length > 1
  const validCommand = Object.values(constant.validAddCommand).includes(args[0])

  if (hasLength || !validCommand) {
    error({
      err: message.ERROR_INVALID_COMMAND
    })
  }

  const command = args[0]

  switch (command) {
    case constant.validAddCommand.PLUGIN:
      addPlugin()
        .then(answers => {
          console.log(answers)
        })
      break

    case constant.validAddCommand.JS:
    case constant.validAddCommand.CSS:
      addAsset(command)
      break

    case constant.validAddCommand.SCSS:
      addSCSS()
      break

    case constant.validAddCommand.TEMPLATE:
      addTemplate()
      break

    case constant.validAddCommand.LOOP_TEMPLATE:
      addLoopTemplate()
      break

    case constant.validAddCommand.COMPONENT:
      addComponent()
      break

    case constant.validAddCommand.ACTION:
    case constant.validAddCommand.FILTER:
      addHook(command)
      break

    default:
      break
  }
}
