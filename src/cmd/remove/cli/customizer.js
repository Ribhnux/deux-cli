const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const getL10n = require('wp-get-l10n')
const getFileHeader = require('wp-get-file-header')

const CLI = global.deuxcli.require('main')
const {customizerTypes} = global.deuxcmd.require('add/cli/fixtures')
const messages = global.deuxcli.require('messages')
const {captchaMaker} = global.deuxhelpers.require('util/cli')
const {capitalize} = global.deuxhelpers.require('util/misc')
const {filelist} = global.deuxhelpers.require('util/file')
const compileFile = global.deuxhelpers.require('compiler/single')

class RemoveCustomizer extends CLI {
  constructor(options) {
    super()
    this.customizer = undefined
    this.init(options)
  }

  /**
   * Setup remove customizer prompts
   */
  prepare() {
    this.customizer = this.themeInfo('customizer')
    const panels = Object.keys(this.customizer.panels).length
    const sections = Object.keys(this.customizer.sections).length
    const settings = Object.keys(this.customizer.settings).length
    const controlTypes = Object.keys(this.customizer.control_types).length

    if ((panels + sections + settings + controlTypes) === 0) {
      this.$logger.happyExit()
    }

    this.$title = 'Remove {Customizer}'
    this.$prompts = [
      {
        type: 'list',
        name: 'customizer.type',
        message: 'Select customizer type you want to remove',
        choices: () => new Promise(resolve => {
          const list = [new inquirer.Separator()]

          if (Object.keys(this.customizer.panels).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.PANEL)}s`,
              value: customizerTypes.PANEL
            })
          }

          if (Object.keys(this.customizer.sections).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.SECTION)}s`,
              value: customizerTypes.SECTION
            })
          }

          if (Object.keys(this.customizer.settings).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.SETTING)}s`,
              value: customizerTypes.SETTING
            })
          }

          if (Object.keys(this.customizer.control_types).length > 0) {
            list.push({
              name: `${capitalize(customizerTypes.CONTROL_TYPE.replace(/_/g, ' '))}s`,
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
          return Object.keys(this.customizer.panels).length > 0 &&
            customizer.type === customizerTypes.PANEL
        },
        choices: () => new Promise(resolve => {
          const list = [new inquirer.Separator()]

          for (const value in this.customizer.panels) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.panels, value)) {
              list.push({
                name: getL10n(this.customizer.panels[value].title.___$string),
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
        default: true,
        message: 'Remove all sections and settings under selected panels?',
        when: ({customizer}) => {
          return Object.keys(this.customizer.panels).length > 0 &&
            customizer.type === customizerTypes.PANEL
        }
      },

      {
        type: 'checkbox',
        name: 'customizer.sections',
        message: 'Choose Sections',
        when: ({customizer}) => {
          return Object.keys(this.customizer.sections).length > 0 &&
            customizer.type === customizerTypes.SECTION
        },
        choices: () => new Promise(resolve => {
          const list = [new inquirer.Separator()]

          for (const value in this.customizer.sections) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.sections, value)) {
              list.push({
                name: getL10n(this.customizer.sections[value].title.___$string),
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
        default: true,
        message: 'Remove all settings under selected sections?',
        when: ({customizer}) => {
          return Object.keys(this.customizer.sections).length > 0 &&
            customizer.type === customizerTypes.SECTION
        }
      },

      {
        type: 'checkbox',
        name: 'customizer.settings',
        message: 'Choose Settings',
        when: ({customizer}) => {
          return Object.keys(this.customizer.settings).length > 0 &&
            customizer.type === customizerTypes.SETTING
        },
        choices: () => new Promise(resolve => {
          const list = [new inquirer.Separator()]

          for (const key in this.customizer.controls) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.controls, key)) {
              list.push({
                name: getL10n(this.customizer.controls[key].label.___$string),
                value: this.customizer.controls[key].settings
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
          return Object.keys(this.customizer.control_types).length > 0 &&
            customizer.type === customizerTypes.CONTROL_TYPE
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          Promise.all(Object.keys(this.customizer.control_types).map(
            value => new Promise((resolve, reject) => {
              const controlPath = this.currentThemePath('includes', 'customizer', 'controls', `class-wp-customize-${value}-control.php`)
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
          }).catch(this.$logger.exit)
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

    if (anySelected === false || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    let items

    switch (customizer.type) {
      case customizerTypes.PANEL:
        items = customizer.panels
        break

      case customizerTypes.SECTION:
        items = customizer.sections
        break

      case customizerTypes.SETTING:
        items = customizer.settings
        break

      case customizerTypes.CONTROL_TYPE:
        items = customizer.control_types
        break

      default: break
    }

    Promise.all(items.map(
      item => new Promise(resolve => {
        if (customizer.type === customizerTypes.PANEL) {
          if (customizer.panelsChild && customizer.panelsChild === true) {
            // Remove All sections under panels.
            Object.keys(this.customizer.sections).forEach(sectionName => {
              if (this.customizer.sections[sectionName].panel === item) {
                // Remove all controls and settings under sections.
                Object.keys(this.customizer.controls).forEach(controlName => {
                  if (this.customizer.controls[controlName].section === sectionName) {
                    const settingName = this.customizer.controls[controlName].settings
                    delete this.customizer.settings[settingName]
                    delete this.customizer.controls[controlName]
                  }
                })

                delete this.customizer.sections[sectionName]
              }
            })
          }

          delete this.customizer.panels[item]
        }

        if (customizer.type === customizerTypes.SECTION) {
          if (customizer.sectionsChild && customizer.sectionsChild === true) {
            // Remove all controls and settings under sections.
            Object.keys(this.customizer.controls).forEach(controlName => {
              if (this.customizer.controls[controlName].section === item) {
                const settingName = this.customizer.controls[controlName].settings
                delete this.customizer.settings[settingName]
                delete this.customizer.controls[controlName]
              }
            })
          }

          delete this.customizer.sections[item]
        }

        if (customizer.type === customizerTypes.SETTING) {
          const controlName = `${item}_control`
          const settingName = this.customizer.controls[controlName].settings
          delete this.customizer.settings[settingName]
          delete this.customizer.controls[controlName]
        }

        if (customizer.type === customizerTypes.CONTROL_TYPE) {
          rimraf.sync(this.currentThemePath('includes', 'customizer', 'controls', `class-wp-customize-${item}-control.php`))
          rimraf.sync(this.currentThemePath('includes', 'customizer', 'assets-src', 'sass', 'controls', `_${item}.scss`))
          delete this.customizer.control_types[item]
        }

        resolve()
      })
    ).concat([
      new Promise(resolve => {
        const scssPath = ['includes', 'customizer', 'assets-src', 'sass']

        const sassControls = Object.keys(this.customizer.control_types)
          .map(item => `'controls/${item}'`)
          .join(',\n  ')

        const sassBase = filelist(this.currentThemePath(...scssPath.concat('base')))
          .filter(item => path.extname(item) === '.scss')
          .map(item => `'base/${item.replace('_', '')}'`)
          .join(',\n  ')

        compileFile({
          srcPath: this.templateSourcePath(...scssPath.concat('customizer.scss')),
          dstPath: this.currentThemePath(...scssPath.concat('customizer.scss')),
          syntax: {
            sass: {
              base: sassBase,
              controls: sassControls
            }
          }
        })
        resolve()
      })
    ])).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            customizer: this.customizer
          })
          resolve()
        })
      ]).then(
        this.$logger.finish(messages.SUCCEED_REMOVED_CUSTOMIZER)
      ).catch(this.$logger.exit)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveCustomizer
