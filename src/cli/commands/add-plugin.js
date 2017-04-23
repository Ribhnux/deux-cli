import inquirer from 'inquirer'
import {colorlog} from '../../lib/logger'
import * as message from '../../lib/messages'

export default options => {
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
