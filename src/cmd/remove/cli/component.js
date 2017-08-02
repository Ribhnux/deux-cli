const {existsSync} = require('fs')
const wpFileHeader = require('wp-get-file-header')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveComponent extends CLI {
  constructor() {
    super()
    this.themeComponents = undefined
    this.init()
  }

  /**
   * Setup remove assets prompts
   */
  prepare() {
    this.themeComponents = this.themeInfo('components')

    if (this.themeComponents.length === 0) {
      happyExit()
    }

    this.title = 'Remove {Components}'
    this.prompts = [
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
    if (components.length === 0 || !confirm) {
      happyExit()
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
      Promise.all([
        new Promise(resolve => {
          this.themeComponents = this.themeComponents.filter(item => !list.includes(item))
          resolve()
        }),

        new Promise(resolve => {
          this.setThemeConfig({
            components: uniq(this.themeComponents)
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_COMPONENT)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveComponent
