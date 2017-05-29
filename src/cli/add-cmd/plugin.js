/* eslint-disable camelcase */
import path from 'path'
import inquirer from 'inquirer'
import _s from 'string'
import {AllHtmlEntities as HTMLEntities} from 'html-entities'
import searchPlugin from 'wp-plugin-search'
import * as message from '../lib/messages'
import validator from '../lib/validator'
import {colorlog, done} from '../lib/logger'
import {wpThemeDir, templateDir, pluginSourceType} from '../lib/const'
import {compileFile} from '../lib/utils'
import {dbErrorHandler, getCurrentTheme, saveConfig} from '../lib/db-utils'

const entities = new HTMLEntities()
export default db => {
  colorlog('Add a {New Plugin} Dependencies')

  const prompts = [
    {
      type: 'list',
      name: 'pluginSource',
      message: 'Plugin Source',
      choices: [
        {
          name: 'WordPress.org',
          value: pluginSourceType.WP
        },
        {
          name: 'Private Repo',
          value: pluginSourceType.PRIVATE
        }
      ]
    },

    {
      name: 'search',
      message: 'Search Plugin',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
      when: ({pluginSource}) => pluginSource === pluginSourceType.WP
    },

    {
      type: 'list',
      name: 'plugin',
      message: 'Select Plugin',
      when: ({pluginSource}) => pluginSource === pluginSourceType.WP,
      choices: ({search}) => new Promise(resolve => {
        searchPlugin(search).then(result => {
          if (result.total > 0) {
            const list = result.items.map(item => {
              const {slug, versions, short_description} = item
              const name = entities.decode(item.name)
              return {
                name: `${name}`,
                value: {
                  name,
                  slug,
                  short_description,
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
      when: ({pluginSource, plugin}) => pluginSource === pluginSourceType.WP && plugin.slug,
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

        list.push({
          value: -1,
          name: 'Latest'
        })
        const filteredList = list.filter(item => item.name !== 'trunk').reverse()
        filteredList.splice(0, 0, new inquirer.Separator())
        resolve(filteredList)
      })
    },

    {
      name: 'name',
      message: 'Plugin Name',
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'source',
      message: 'Plugin URL',
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {url: true, ext: 'zip', var: `"${value}"`})
    },

    {
      name: 'slug',
      message: 'Plugin Slug',
      default: ({name}) => _s(name).slugify().s,
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {minimum: 3, slug: true, var: 'Plugin slug'})
    },

    {
      name: 'version',
      message: 'Plugin Version',
      default: '1.0.0',
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {semver: true, var: `"${value}"`})
    },

    {
      name: 'desc',
      message: 'Description',
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      name: 'external_url',
      message: 'Homepage',
      when: ({pluginSource}) => pluginSource === pluginSourceType.PRIVATE,
      validate: value => validator(value, {url: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'required',
      message: 'Is this plugin required?',
      default: true
    },

    {
      type: 'confirm',
      name: 'force_activation',
      message: 'Force to activate this plugin when installing theme?',
      default: true
    },

    {
      type: 'confirm',
      name: 'force_deactivation',
      message: 'Force to de-activate this plugin when uninstalling theme?',
      default: false
    },

    {
      type: 'confirm',
      name: 'init',
      message: 'Need a custom hook / initialization?',
      default: false
    }
  ]

  return inquirer.prompt(prompts).then(answers => {
    getCurrentTheme(db).then(result => {
      const {
        init,
        name,
        slug,
        desc,
        source,
        version,
        required,
        external_url,
        pluginSource,
        force_activation,
        force_deactivation
      } = answers

      let {
        plugin
      } = answers

      const {
        docId,
        themeName,
        textDomain,
        version: themeVersion
      } = result

      const pluginData = {
        init,
        name,
        source,
        required,
        force_activation,
        force_deactivation
      }

      switch (pluginSource) {
        case pluginSourceType.WP:
          pluginData.name = plugin.name

          if (version.value !== -1) {
            pluginData.source = version.source
            pluginData.version = version.value
            pluginData.external_url = `https://wordpress.org/plugins/${plugin.slug}/`
          }
          break

        case pluginSourceType.PRIVATE:
          plugin = {
            name,
            slug: slug || _s(name).slugify().s,
            short_description: desc
          }
          pluginData.version = version
          pluginData.external_url = external_url
          break

        default:
          // Noop
          break
      }

      db.upsert(docId, doc => {
        doc.plugins[plugin.slug] = pluginData
        compileFile({
          srcPath: path.join(templateDir, '_partials', 'plugin.php'),
          dstPath: path.join(wpThemeDir, textDomain, 'plugins', `${plugin.slug}.php`),
          syntax: {
            init,
            themeName,
            version: themeVersion,
            pluginName: plugin.name,
            pluginDesc: plugin.short_description,
            pluginLink: pluginData.external_url
          }
        })
        return doc
      }).then(() => {
        saveConfig(db, docId).then(() => {
          done({
            message: message.SUCCEED_PLUGIN_ADDED,
            paddingTop: true,
            exit: true
          })
        })
      }).catch(dbErrorHandler)
    })
  })
}
