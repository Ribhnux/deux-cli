import jsonr from 'json-realtime'
import logSymbols from 'log-symbols'
import chalk from 'chalk'
import * as message from '../../lib/messages'
import {projectPath, validListCommand} from '../../lib/const'
import {error, colorlog} from '../../lib/logger'

const deuxProject = jsonr(projectPath)

const getActions = () => {
  colorlog('Action hook list. You have a total of {0} actions.')
}

const getAssets = () => {
  colorlog('Assets list. You have a total of {0} assets.')
}

const getFilters = () => {
  colorlog('Filter hook list. You have a total of {0} filters.')
}

const getPlugins = () => {
  colorlog('Plugin hook list. You have a total of {0} plugins.')
}

const getProjects = () => {
  colorlog(`Project list. You have a total of {${Object.keys(deuxProject.list).length}} projects.`)
  for (const key in deuxProject.list) {
    if (Object.prototype.hasOwnProperty.call(deuxProject.list, key)) {
      const msg = [logSymbols.success, deuxProject.list[key].themeName]
      if (deuxProject.current === key) {
        msg.push(`${chalk.green('active')}`)
      }
      console.log(...msg)
    }
  }
}

const getTemplates = () => {
  colorlog('PostType template list. You have a total of {0} templates.')
}

const getComponents = () => {
  colorlog('Component list. You have a total of {0} components.')
}

const getLoopTemplates = () => {
  colorlog('Loop-Template list. You have a total of {0} custom loop-template.')
}

export default args => {
  const hasLength = args.length && args.length > 1
  const validCommand = Object.values(validListCommand).includes(args[0])

  if (hasLength || !validCommand) {
    error({
      err: message.ERROR_INVALID_COMMAND
    })
  }

  switch (args[0]) {
    case validListCommand.ACTION:
      getActions()
      break
    case validListCommand.ASSETS:
      getAssets()
      break
    case validListCommand.FILTER:
      getFilters()
      break
    case validListCommand.PLUGIN:
      getPlugins()
      break
    case validListCommand.PROJECT:
      getProjects()
      break
    case validListCommand.TEMPLATE:
      getTemplates()
      break
    case validListCommand.COMPONENT:
      getComponents()
      break
    case validListCommand.LOOP_TEMPLATE:
      getLoopTemplates()
      break
    default: break
  }
}
