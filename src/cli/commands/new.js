import inquirer from 'inquirer'
import faker from 'faker'
import S from 'string'
import Listr from 'listr'
import path from 'path'
import mkdirp from 'mkdirp'
import { existsSync } from 'fs'
import { validTags, wpThemeDir } from '../../lib/const'
import { error, colorlog } from '../../lib/logger'
import * as message from '../../lib/messages'

export default () => {
  colorlog(`Add new {theme}`)
  const currentProject = {}

  const prompts = [
    {
      type: 'input',
      name: 'themeName',
      message: 'Theme Name',
      default: 'Deux Theme'
    },

    {
      type: 'input',
      name: 'themeUri',
      message: 'Theme URI',
      default: 'http://wordpress.org'
    },

    {
      type: 'input',
      name: 'author',
      message: 'Author',
      default: faker.name.findName()
    },

    {
      type: 'input',
      name: 'authorUri',
      message: 'Author URI',
      default: 'http://wordpress.org'
    },

    {
      type: 'input',
      name: 'description',
      message: 'Description',
      default: faker.lorem.sentence()
    },

    {
      type: 'input',
      name: 'version',
      message: 'Version',
      default: '1.0.0'
    },

    {
      type: 'checkbox',
      message: 'Tags',
      name: 'tags',
      choices: [
        new inquirer.Separator('Tag List'),
        ...validTags.map(value => {
          return {
            value,
            name: S(value).humanize().s
          }
        })
      ],
      validate: answer => {
        if (answer.length < 1) {
          return 'Please select at least one tag.'
        }

        return true
      }
    },

    {
      type: 'confirm',
      name: 'isChild',
      message: 'Child theme',
      default: false
    },

    {
      type: 'input',
      name: 'repo',
      message: 'Repository',
      default: 'https://github.com/'
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?',
    }
  ]

  return inquirer
    .prompt(prompts)
    .then(answers => {
      if (!answers.confirm) {
        console.log('')
        error({ err: 'Theme creation was canceled.' })
      }

      const themeNameLower = answers.themeName.toLowerCase()
      const themeSlug = S(themeNameLower).slugify().s
      const textDomain = S(themeNameLower).underscore().s
      const themePath = path.join(wpThemeDir, themeSlug)

      console.log('')
      colorlog(`Initialize {${answers.themeName}}`)

      const task = new Listr([
        {
          title: `Make directory ${themePath}`,
          task: () => new Promise((resolve, reject) => {
            if (existsSync(themePath)) {
              throw new Error(message.ERROR_THEME_ALREADY_EXISTS)
            }

            mkdirp(themePath, err => {
              if (err) throw err
              resolve()
            })
          })
        },

        {
          title: 'Init WordPress Theme',
          task: () => new Listr([
            {
              title: 'Copy important templates',
              task: () => true
            },

            {
              title: 'Setup theme structures',
              task: () => true
            }
          ])
        },

        {
          title: 'Git Repository',
          task: () => new Listr([
            {
              title: 'Init repository',
              task: () => true
            },

            {
              title: `Add remote url \`${answers.repo}\``,
              task: () => true
            }
          ])
        },

        {
          title: 'Save config [.deuxconfig]',
          task: () => {
            return true
          }
        },

        {
          title: `Save ${answers.themeName} to project [.deuxproject]`,
          task: () => {
            return true
          }
        },
      ])

      task.run()
        .catch(err => {
          console.log('')
          error({ err })
          console.log('')
        })
    })
}
