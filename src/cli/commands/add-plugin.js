import path from 'path'
import inquirer from 'inquirer'
import jsonr from 'json-realtime'
import searchPlugin from 'wp-plugin-search'
import * as message from '../../lib/messages'
import {error, colorlog} from '../../lib/logger'
import {projectPath, wpThemeDir, deuxConfig} from '../../lib/const'

export default () => {
  colorlog('Add {plugin} dependencies')

  const prompts = [
    {
      type: 'list',
      name: 'source',
      message: 'Plugin Source',
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
      message: 'Search Plugin',
      validate: value => {
        if (value.length < 2) {
          return 'Search Query should be at least 2 letters.'
        }

        return true
      },
      when: ({source}) => source === 'wordpress'
    },
    {
      type: 'list',
      name: 'plugin',
      message: 'Select Plugin',
      when: ({source}) => source === 'wordpress',
      choices: ({search}) => new Promise(resolve => {
        searchPlugin(search).then(result => {
          if (result.total > 0) {
            const list = result.items.map(item => {
              const {name, slug, versions} = item
              return {
                name: `${name}`,
                value: {
                  name,
                  slug,
                  versions
                }
              }
            })
            list.splice(0, 0, new inquirer.Separator())
            resolve(list)
          }
        })
      })
    },
    {
      type: 'list',
      name: 'version',
      message: 'Choose Version',
      when: ({source, plugin}) => source === 'wordpress' && plugin.slug,
      choices: ({plugin}) => new Promise(resolve => {
        const list = []
        for (const value in plugin.versions) {
          if ({}.hasOwnProperty.call(plugin.versions, value)) {
            const source = plugin.versions[value]
            list.push({
              name: value,
              value: {
                value,
                source
              }
            })
          }
        }
        const filteredList = list.filter(item => item.name !== 'trunk').reverse()
        filteredList.splice(0, 0, new inquirer.Separator())
        resolve(filteredList)
      })
    },
    {
      type: 'text',
      name: 'url',
      message: 'Plugin URL',
      hint: '.zip extension',
      when: ({source}) => {
        return source === 'private'
      },
      validate: value => {
        if (value.substr(value.length, -4) !== '.zip') {
          return message.ERROR_REPOSITORY_URL_NOT_ZIP
        }
        return true
      }
    },
    {
      type: 'confirm',
      name: 'required',
      message: 'Is this plugin required?',
      default: true
    },
    {
      type: 'confirm',
      name: 'forceActivation',
      message: 'Force to activate this plugin when installing theme?',
      default: true
    },
    {
      type: 'confirm',
      name: 'forceDeactivation',
      message: 'Force to de-activate this plugin when uninstalling theme?',
      default: false
    },
    {
      type: 'confirm',
      name: 'init',
      message: 'Need an initialization to load this plugin?',
      default: false
    }
  ]

  return inquirer
    .prompt(prompts)
    .then(answers => {
      const deuxProject = jsonr(projectPath)
      if (deuxProject.current === '') {
        error({
          message: message.ERROR_INVALID_PROJECT,
          error: true,
          padding: true
        })
      }

      let {
        name,
        slug,
        plugin,
        version,
        required,
        url: source,
        source: pluginSrc,
        forceActivation: force_activation,
        forceDeactivation: force_deactivation,
        extUrl: external_url
      } = answers

      if (pluginSrc === 'wordpress') {
        name = plugin.name
        slug = plugin.slug
        source = version.source
        version = version.value
        external_url = `https://wordpress.org/plugins/${slug}/`
      }

      const themePath = path.join(wpThemeDir, deuxProject.current)
      const themeConfig = jsonr(path.join(themePath, deuxConfig))

      /* eslint-disable camelcase */
      const pluginObject = {
        name,
        source,
        version,
        required,
        force_activation,
        force_deactivation,
        external_url
      }

      themeConfig.plugins[slug] = pluginObject
    })
}
