const inquirer = require('inquirer')
const rimraf = require('rimraf')
const getL10n = require('wp-get-l10n')
const getFileHeader = require('wp-get-file-header')

const CLI = global.deuxcli.require('main')
const {customizerTypes} = global.deuxcmd.require('add/cli/fixtures')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')
const {happyExit, captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')
const {capitalize} = global.deuxhelpers.require('util/misc')

class RemoveCustomizer extends CLI {
  constructor() {
    super()
    this.themeCustomizer = undefined
    this.init()
  }

  /**
   * Setup remove customizer prompts
   */
  prepare() {
    this.themeCustomizer = this.themeInfo('customizer')
    let hasCustomizers = false

    for (const key in this.themeCustomizer) {
      if (Object.prototype.hasOwnProperty.call(this.themeCustomizer, key)) {
        if (key !== `${customizerTypes.CONTROL}s`) {
          continue
        }

        hasCustomizers = Object.keys(this.themeCustomizer[key]).length > 0
      }
    }

    if (hasCustomizers === false) {
      happyExit()
    }

    this.title = 'Remove {Customizer}'
    this.prompts = [
      {
        type: 'list',
        name: 'customizer.type',
        message: 'Select customizer type you want to remove',
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          if (Object.keys(this.themeCustomizer.panels).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.PANEL)}s`,
              value: customizerTypes.PANEL
            })
          }

          if (Object.keys(this.themeCustomizer.sections).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.SECTION)}s`,
              value: customizerTypes.SECTION
            })
          }

          if (Object.keys(this.themeCustomizer.settings).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.SETTING)}s`,
              value: customizerTypes.SETTING
            })
          }

          if (Object.keys(this.themeCustomizer.control_types).length > 0) {
            list.push({
              name: `Custom ${capitalize(customizerTypes.CONTROL_TYPE.replace(/_/g, ' '))}s`,
              value: customizerTypes.CONTROL_TYPE
            })
          }

          resolve(list)
        })
      },

      {
        type: 'checkbox',
        name: 'customizer.panels',
        message: 'Choose Panels',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.panels).length > 0 &&
            customizer.type === customizerTypes.PANEL
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const value in this.themeCustomizer.panels) {
            if (Object.prototype.hasOwnProperty.call(this.themeCustomizer.panels, value)) {
              list.push({
                name: getL10n(this.themeCustomizer.panels[value].title.___$string),
                value
              })
            }
          }

          resolve(list)
        })
      },

      {
        type: 'confirm',
        name: 'customizer.panelsChild',
        default: false,
        message: 'Remove all sections and settings under selected panels?',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.panels).length > 0 &&
            customizer.type === customizerTypes.PANEL
        }
      },

      {
        type: 'checkbox',
        name: 'customizer.sections',
        message: 'Choose Sections',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.sections).length > 0 &&
            customizer.type === customizerTypes.SECTION
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const value in this.themeCustomizer.sections) {
            if (Object.prototype.hasOwnProperty.call(this.themeCustomizer.sections, value)) {
              list.push({
                name: getL10n(this.themeCustomizer.sections[value].title.___$string),
                value
              })
            }
          }

          resolve(list)
        })
      },

      {
        type: 'confirm',
        name: 'customizer.sectionsChild',
        default: false,
        message: 'Remove all settings under selected sections?',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.sections).length > 0 &&
            customizer.type === customizerTypes.SECTION
        }
      },

      {
        type: 'checkbox',
        name: 'customizer.settings',
        message: 'Choose Settings',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.settings).length > 0 &&
            customizer.type === customizerTypes.SETTING
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const key in this.themeCustomizer.controls) {
            if (Object.prototype.hasOwnProperty.call(this.themeCustomizer.controls, key)) {
              list.push({
                name: getL10n(this.themeCustomizer.controls[key].label.___$string),
                value: this.themeCustomizer.controls[key].settings
              })
            }
          }

          resolve(list)
        })
      },

      {
        type: 'checkbox',
        name: 'customizer.control_types',
        message: 'Choose Custom Control Types',
        when: ({customizer}) => {
          return Object.keys(this.themeCustomizer.control_types).length > 0 &&
            customizer.type === customizerTypes.CONTROL_TYPE
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          Promise.all(Object.keys(this.themeCustomizer.control_types).map(
            value => new Promise((resolve, reject) => {
              const controlPath = this.currentThemePath('includes', 'customizers', 'controls', value, `class-wp-customize-${value}-control.php`)
              getFileHeader(controlPath).then(info => {
                if (info.controlName) {
                  resolve({
                    name: info.controlName,
                    value
                  })
                } else {
                  resolve(undefined)
                }
              }).then(reject)
            })
          )).then(controlList => {
            controlList = controlList.filter(item => item)
            if (controlList.length > 0) {
              list = list.concat(controlList)
            }

            resolve(list)
          }).catch(exit)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({customizer}) => {
          return (customizer.panels && customizer.panels.length > 0) ||
          (customizer.sections && customizer.sections.length > 0) ||
          (customizer.settings && customizer.settings.length > 0) ||
          (customizer.control_types && customizer.control_types.length > 0)
        }
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({customizer, captcha}) => {
          return captcha && ((customizer.panels && customizer.panels.length > 0) ||
          (customizer.sections && customizer.sections.length > 0) ||
          (customizer.settings && customizer.settings.length > 0) ||
          (customizer.control_types && customizer.control_types.length > 0))
        },
        default: false,
        message: () => 'Removing customizer from theme can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove customizer file and config
   *
   * @param {Object} {customizer, confirm}
   */
  action({customizer, confirm}) {
    const anySelected = ((customizer.panels && customizer.panels.length > 0) ||
    (customizer.sections && customizer.sections.length > 0) ||
    (customizer.settings && customizer.settings.length > 0) ||
    (customizer.control_types && customizer.control_types.length > 0))

    if (anySelected === false || !confirm) {
      happyExit()
    }

    Promise.all(features.map(
      type => new Promise((resolve, reject) => {
        const removeFiles = []

        switch (type) {
          case featureTypes.CUSTOM_BACKGROUND:
            if ('wp-head-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-background')
            }
            break

          case featureTypes.CUSTOM_HEADER:
            if ('wp-head-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-header')
            }

            if ('video-active-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-header-video')
            }
            break

          default: break
        }

        Promise.all(removeFiles.map(
          filename => new Promise(resolve => {
            rimraf.sync(this.currentThemePath('includes', 'helpers', `${filename}.php`))
            resolve(filename)
          })
        )).then(filenames => {
          this.themeHelpers = this.themeHelpers.filter(item => !filenames.includes(item))
          delete this.themeFeatures[type]
          resolve()
        }).catch(reject)
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            features: this.themeFatures,
            helpers: this.themeHelpers
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_FEATURE)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveCustomizer
