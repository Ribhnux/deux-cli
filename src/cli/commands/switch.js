import chalk from 'chalk'
import inquirer from 'inquirer'
import jsonr from 'json-realtime'
import * as message from '../../lib/messages'
import {projectPath} from '../../lib/const'
import {error, done, colorlog} from '../../lib/logger'

const deuxProject = jsonr(projectPath)
const succeedMsg = theme => {
  return `Your project have been switched to ${chalk.bold.magenta(`${theme}`)}`
}

const displayPrompt = () => {
  colorlog(`Switch to another {project}`)
  const prompts = [
    {
      type: 'list',
      name: 'currentTheme',
      message: 'Select project',
      choices: () => new Promise(resolve => {
        const choices = []
        for (const value in deuxProject.list) {
          if (Object.prototype.hasOwnProperty.call(deuxProject.list, value)) {
            choices.push({
              value,
              name: deuxProject.list[value].themeName
            })
          }
        }
        resolve(choices)
      })
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    }
  ]

  inquirer.prompt(prompts).then(answers => {
    if (answers.confirm) {
      if (answers.currentTheme === deuxProject.current) {
        done({
          message: message.SUCCEED_ALREADY_IN_CURRENT_PROJECT,
          exit: true,
          paddingTop: true
        })
      }

      deuxProject.current = answers.currentTheme
      done({
        message: succeedMsg(deuxProject.list[answers.currentTheme].themeName),
        exit: true,
        paddingTop: true
      })
    }
  })
}

const setDirectly = currentTheme => {
  if (!(currentTheme in deuxProject.list)) {
    error({
      message: message.ERROR_THEME_NOT_IN_LIST,
      exit: true,
      paddingTop: true
    })
  }

  if (deuxProject.current === currentTheme) {
    done({
      message: message.SUCCEED_ALREADY_IN_CURRENT_PROJECT,
      exit: true,
      paddingTop: true
    })
  }

  deuxProject.current = currentTheme
  done({
    message: succeedMsg(deuxProject.list[currentTheme].themeName),
    exit: true,
    paddingTop: true
  })
}

export default args => {
  switch (args.length) {
    case 0:
      displayPrompt()
      break

    case 1:
      setDirectly(args[0])
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
