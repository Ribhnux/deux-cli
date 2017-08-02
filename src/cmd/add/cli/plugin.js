/* eslint-disable camelcase */
const inquirer = require('inquirer')
const Entities = require('html-entities').AllHtmlEntities
const searchPlugin = require('wp-plugin-search')
const slugify = require('node-slugify')
const rimraf = require('rimraf')
const {pluginSrcTypes} = require('./const')

const entities = new Entities()

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {loader, exit, finish} = global.deuxhelpers.require('logger')
const {capitalize} = global.deuxhelpers.require('util/misc')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddPlugin extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup add plugin prompts
   */
  prepare() {
    this.title = 'Add {New Plugin} Dependencies'
    this.prompts = [
      {
        type: 'list',
        name: 'plugin.srctype',
        message: 'Plugin Source',
        choices: [
          {
            name: 'WordPress.org',
            value: pluginSrcTypes.WP
          },
          {
            name: 'Private Repo',
            value: pluginSrcTypes.PRIVATE
          }
        ]
      },

      {
        name: 'plugin.search',
        message: 'Search Plugin',
        validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.WP
      },

      {
        type: 'list',
        name: 'plugin.item',
        message: 'Select Plugin',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.WP,
        choices: ({plugin}) => new Promise((resolve, reject) => {
          const searchLoader = loader(`Searching "${plugin.search}" from WordPress.org`)

          searchPlugin(plugin.search).then(result => {
            searchLoader.succeed(`Found ${result.total} item(s)`)

            if (result.total > 0) {
              const list = result.items.map(item => {
                const {slug, version, versions, short_description: description} = item
                const name = entities.decode(item.name)

                return {
                  name: `${name}`,
                  value: {
                    name,
                    slug,
                    description,
                    version,
                    versions
                  }
                }
              })

              list.splice(0, 0, new inquirer.Separator())
              resolve(list)
            }
          }).catch(reject)
        })
      },

      {
        type: 'list',
        name: 'plugin.versions',
        message: 'Choose Version',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.WP && plugin.item.slug,
        choices: ({plugin}) => new Promise(resolve => {
          const list = []
          const versionRegx = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)+(\.(?:0|[1-9]\d*))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig // eslint-disable-line no-useless-escape

          for (const key in plugin.item.versions) {
            if ({}.hasOwnProperty.call(plugin.item.versions, key)) {
              const source = plugin.item.versions[key]
              const matchVersion = key.match(versionRegx)
              let version = key

              if (matchVersion && matchVersion.length > 0) {
                version = matchVersion[0]
              }

              list.push({
                name: version,
                value: {
                  value: version,
                  source
                }
              })
            }
          }

          list.push({
            value: -1,
            name: `Latest ${plugin.item.version}`
          })

          const filteredList = list.filter(item => item.name !== 'trunk').reverse()
          filteredList.splice(0, 0, new inquirer.Separator())
          resolve(filteredList)
        })
      },

      {
        name: 'plugin.name',
        message: 'Plugin Name',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        name: 'plugin.source',
        message: 'Plugin URL',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {url: true, ext: 'zip', var: `"${value}"`})
      },

      {
        name: 'plugin.slug',
        message: 'Plugin Slug',
        default: ({plugin}) => slugify(plugin.name),
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {minimum: 3, slug: true, var: 'Plugin slug'})
      },

      {
        name: 'plugin.version',
        message: 'Plugin Version',
        default: '1.0.0',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {semver: true, var: `"${value}"`})
      },

      {
        name: 'plugin.description',
        message: 'Description',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        name: 'plugin.external_url',
        message: 'Homepage',
        when: ({plugin}) => plugin.srctype === pluginSrcTypes.PRIVATE,
        validate: value => validator(value, {url: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'plugin.required',
        message: 'Is this plugin required?',
        default: true
      },

      {
        type: 'confirm',
        name: 'plugin.force_activation',
        message: 'Force to activate this plugin when installing theme?',
        default: true
      },

      {
        type: 'confirm',
        name: 'plugin.force_deactivation',
        message: 'Force to de-activate this plugin when uninstalling theme?',
        default: false
      },

      {
        type: 'confirm',
        name: 'plugin.init',
        message: 'Need a custom hook / initialization?',
        default: false
      },

      {
        type: 'confirm',
        name: 'plugin.overwrite',
        message: 'Plugin already exists. Continue to overwrite?',
        default: true,
        when: ({plugin}) => new Promise(resolve => {
          const slug = plugin.srctype === pluginSrcTypes.PRIVATE ? plugin.slug : plugin.item.slug
          resolve(slug in this.themeInfo('plugins'))
        })
      }
    ]
  }

  /**
   * Compile plugin initializator file and config
   *
   * @param {Object} {plugin}
   */
  action({plugin}) {
    if (plugin.overwrite === false) {
      exit(messages.ERROR_PLUGIN_ALREADY_EXISTS)
    }

    const plugins = this.themeInfo('plugins')

    Promise.all([
      new Promise(resolve => {
        if (plugin.srctype === pluginSrcTypes.WP) {
          plugin.name = plugin.item.name
          plugin.slug = plugin.item.slug
          plugin.description = plugin.item.description
          plugin.external_url = `https://wordpress.org/plugins/${plugin.slug}/`

          if (plugin.versions !== -1) {
            plugin.source = plugin.versions.source
            plugin.version = plugin.versions.value
          }
        }

        // Safe string
        plugin.name = capitalize(slugify(plugin.name, {replacement: ' '}))

        const initPath = this.currentThemePath('includes', 'plugins', `${plugin.slug}.php`)

        if (plugin.init) {
          compileFile({
            srcPath: this.templateSourcePath('_partials', 'plugin.php'),
            dstPath: initPath,
            syntax: {
              theme: this.themeDetails(),
              plugin
            }
          })
        }

        if (plugin.overwrite && !plugin.init) {
          rimraf.sync(initPath)
        }

        delete plugin.item
        delete plugin.versions
        delete plugin.search
        delete plugin.srctype
        delete plugin.external_url

        plugins[plugin.slug] = plugin
        delete plugins[plugin.slug].slug

        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({plugins})
        resolve()
      })
    ]).then(
      finish(messages.SUCCEED_PLUGIN_ADDED)
    ).catch(exit)
  }
}

module.exports = AddPlugin
