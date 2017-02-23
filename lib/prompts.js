const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const faker = require('faker')
const S = require('string')
const constant = require('./const')
const logger = require('./logger')
const utils = require('./utils')
const messages = require('./messages')

exports.preinit = () => {
  const prompts = [
    {
      type: 'list',
      name: 'init',
      message: messages.PROMPT_INIT_PROJECT,
      choices: [
        {
          name: messages.PROMPT_NEW_PROJECT,
          value: constant.PROJECT_STATUS_NEW
        },

        {
          name: messages.PROMPT_EXISTING_PROJECT,
          value: constant.PROJECT_STATUS_EXISTING
        }
      ]
    }
  ]

  return new Promise(resolve => {
    inquirer.prompt(prompts).then(resolve)
  })
}

exports.chooseProject = () => {
  let list = []

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(constant.PROJECT_FILE_PATH)) {
      return reject(new Error(messages.ERROR_PROJECT_FILE_NOT_EXISTS))
    }

    const projects = fs.readFileSync(constant.PROJECT_FILE_PATH)
    if (!utils.isJson(projects)) {
      return reject(new Error(messages.ERROR_PROJECT_FILE_INVALID_JSON))
    }

    const projectJson = JSON.parse(projects)
    for (let i in projectJson.list) {
      list.push(projectJson.list[i])
    }

    const prompts = [
      {
        type: 'list',
        name: 'selected',
        message: messages.PROMPT_CHOOOSE_EXISTING_THEME,
        choices: list.map(item => {
          return {
            value: item,
            name: item.themeName
          }
        })
      }
    ]

    inquirer.prompt(prompts).then(resolve)
  })
}

exports.init = (status, projectSlug) => {
  let projects = {}
  let currentProject = {}

  if (fs.existsSync(constant.PROJECT_FILE_PATH)) {
    const jsonStr = fs.readFileSync(constant.PROJECT_FILE_PATH)
    if (utils.isJson(jsonStr)) {
      projects = JSON.parse(jsonStr)
    }
  }

  if (projectSlug && projects.list[projectSlug] &&
    status === constant.PROJECT_STATUS_EXISTING) {
    currentProject = projects.list[projectSlug]
  }

  const prompts = [
    {
      type: 'input',
      name: 'themeName',
      message: messages.PROMPT_THEME_NAME,
      default: currentProject.themeName || 'Deux Theme'
    },

    {
      type: 'input',
      name: 'themeUri',
      message: messages.PROMPT_THEME_URI,
      default: currentProject.themeUri || 'http://wp.org'
    },

    {
      type: 'input',
      name: 'author',
      message: messages.PROMPT_AUTHOR,
      default: currentProject.author || faker.name.findName()
    },

    {
      type: 'input',
      name: 'authorUri',
      message: messages.PROMPT_AUTHOR_URI,
      default: currentProject.authorUri || 'http://wordpress.com'
    },

    {
      type: 'input',
      name: 'description',
      message: messages.PROMPT_DESCRIPTION,
      default: currentProject.description || faker.lorem.sentences()
    },

    {
      type: 'input',
      name: 'version',
      message: messages.PROMPT_CURRENT_VERSION,
      default: currentProject.version || '1.0.0'
    },

    {
      type: 'input',
      name: 'license',
      message: messages.PROMPT_LICENSE,
      default: currentProject.license || 'GNU General Public License v2 or later'
    },

    {
      type: 'input',
      name: 'licenseUri',
      message: messages.PROMPT_LICENSE_URI,
      default: currentProject.licenseUri || 'http://www.gnu.org/licenses/gpl-2.0.html'
    },

    {
      type: 'checkbox',
      message: messages.PROMPT_TAGS,
      name: 'tags',
      choices: [
        new inquirer.Separator(messages.SEPARATOR_TAG_LIST),
        ...constant.THEME_VALID_TAGS.map(value => {
          let checked = currentProject.tags ? currentProject.tags.includes(value) : false

          return {
            value,
            checked,
            name: S(value).humanize().s
          }
        })
      ],
      validate: answer => {
        if (answer.length < 1) {
          return messages.PROMPT_ERROR_SELECT_TAGS
        }

        return true
      }
    },

    {
      type: 'confirm',
      name: 'current',
      message: messages.PROMPT_SET_AS_CURRENT_PROJECT,
    },
  ]

  return new Promise(resolve => {
    inquirer.prompt(prompts).then(project => {
      if (project.themeName.length < 1) {
        logger.error(messages.ERROR_THEME_NAME_BLANK)
      }

      const themeNameLower = project.themeName.toLowerCase()
      project.textDomain = S(themeNameLower).underscore().s
      project.themeSlug = S(themeNameLower).slugify().s

      const themedir = path.join(constant.WP_THEME_DIR, project.themeSlug)

      utils
        .generate(themedir, project)
        .then(() => {
          if (!projects.list) {
            projects.list = {}
          }

          if (project.current) {
            projects.current = project.themeSlug
          }

          delete project.current

          projects.list[project.themeSlug] = project
          fs.writeFileSync(constant.PROJECT_FILE_PATH, JSON.stringify(projects, true, 2), 'utf-8')

          return resolve(project)
        })
    })
  })
}

