const {existsSync} = require('fs')
const wpFileHeader = require('wp-get-file-header')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveComponent extends CLI {
  constructor(options) {
    super()
    this.themeComponents = undefined
    this.init(false, options)
  }

  /**
   * Setup remove assets prompts
   */
  prepare() {
    this.themeComponents = this.themeInfo('components')

    if (this.themeComponents.length === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Components}'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select components you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all(this.themeComponents.map(
            value => new Promise((resolve, reject) => {
              const componentPath = this.currentThemePath('components', `${value}.php`)
              if (existsSync(componentPath)) {
                wpFileHeader(componentPath).then(info => {
                  resolve({
                    name: info.componentName,
                    value
                  })
                }).catch(reject)
              } else {
                resolve({})
              }
            })
          )).then(components => {
            components = components.filter(item => item.value)

            if (components.length > 0) {
              components = separatorMaker('Component List').concat(components)
            }

            resolve(components)
          }).catch(reject)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({components}) => components.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({components, captcha}) => components.length > 0 && captcha,
        default: false,
        message: () => 'Removing components from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove component file and config
   *
   * @param {Object} {components, confirm}
   */
  action({components, confirm}) {
    if (components.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(components.map(
      item => new Promise(resolve => {
        const componentPath = this.currentThemePath('components', `${item}.php`)
        if (existsSync(componentPath)) {
          rimraf.sync(componentPath)
        }
        resolve(item)
      })
    )).then(list => {
      this.themeComponents = this.themeComponents.filter(item => !list.includes(item))
      this.setThemeConfig({
        components: uniq(this.themeComponents)
      })
    }).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_COMPONENT)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveComponent
