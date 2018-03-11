const path = require('path')
const slugify = require('node-slugify')
const jsonar = require('jsonar')
const inquirer = require('inquirer')
const faker = require('faker')
const getFileHeader = require('wp-get-file-header')
const getL10n = require('wp-get-l10n')
const {
  customizerControlTypes,
  customizerControlLabels,
  customizerSectionTypes,
  customizerSectionLabels,
  customizerPanelTypes,
  customizerPanelLabels
} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const message = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')
const {filelist} = global.deuxhelpers.require('util/file')
const {capitalize} = global.deuxhelpers.require('util/misc')

class AddCustomizer extends CLI {
  constructor(options) {
    super()
    this.customizer = undefined
    this.init(options)
  }

  prepare() {
    this.customizer = this.themeInfo('customizer')
    this.$title = 'Add {Theme Customizer}'
    this.$prompts = [
      {
        name: 'customizer.setting.name',
        message: 'Setting Name',
        default: 'New Setting',
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        name: 'customizer.control.description',
        message: 'Setting Description',
        default: faker.lorem.words()
      },

      {
        type: 'list',
        name: 'customizer.setting.transport',
        message: 'Setting Transport',
        default: 1,
        choices: [
          {
            name: 'Post Message (Realtime)',
            value: 'postMessage'
          },

          {
            name: 'Auto Refresh',
            value: 'refresh'
          }
        ]
      },

      {
        type: 'list',
        name: 'customizer.control.type',
        message: 'Control Type',
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const key in customizerControlTypes) {
            if (Object.prototype.hasOwnProperty.call(customizerControlTypes, key) && customizerControlTypes[key] !== customizerControlTypes.CUSTOM) {
              list.push({
                name: customizerControlLabels[key],
                value: customizerControlTypes[key]
              })
            }
          }

          const definedControls = []
          for (const key in this.customizer.control_types) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.control_types, key)) {
              definedControls.push(key)
            }
          }

          const newControl = () => {
            list.push(new inquirer.Separator())
            list.push({
              name: customizerControlLabels.CUSTOM,
              value: customizerControlTypes.CUSTOM
            })
          }

          if (definedControls.length > 0) {
            Promise.all(definedControls.map(
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

              newControl()
              resolve(list)
            }).catch(this.$logger.exit)
          } else {
            newControl()
            resolve(list)
          }
        })
      },

      {
        name: 'customizer.setting.default',
        message: 'Default Value',
        when: ({customizer}) => {
          return customizer.control.type === customizerControlTypes.TEXT ||
          customizer.control.type === customizerControlTypes.CUSTOM
        }
      },

      {
        name: 'customizer.setting.default',
        message: 'Default Value',
        default: 0,
        when: ({customizer}) => customizer.control.type === customizerControlTypes.NUMBER,
        validate: value => validator(value, {minimum: 0, number: true})
      },

      {
        type: 'list',
        name: 'customizer.setting.default',
        message: 'Default Value',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.CHECKBOX,
        choices: [
          {
            name: 'Enabled',
            value: true
          },

          {
            name: 'Disabled',
            value: false
          }
        ]
      },

      {
        name: 'customizer.control.choices',
        message: ({customizer}) => {
          switch (customizer.control.type) {
            case customizerControlTypes.RADIO:
              return 'Radiobox Values'

            case customizerControlTypes.SELECT:
              return 'Dropdown List'

            default: break
          }
        },
        default: 'Option1, Option2',
        when: ({customizer}) => {
          return customizer.control.type === customizerControlTypes.RADIO ||
            customizer.control.type === customizerControlTypes.SELECT
        },
        filter: value => {
          return value.split(',').map(item => item.trim())
        }
      },

      {
        type: 'list',
        name: 'customizer.setting.default',
        message: 'Default Value',
        when: ({customizer}) => {
          return customizer.control.type === customizerControlTypes.RADIO ||
            customizer.control.type === customizerControlTypes.SELECT
        },
        choices: ({customizer}) => new Promise(resolve => {
          const list = customizer.control.choices.map(item => {
            return {
              name: item,
              value: slugify(item)
            }
          })

          resolve(list)
        })
      },

      {
        name: 'customizer.setting.default',
        message: 'Default Value',
        default: 'email@domain.com',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.EMAIL,
        validate: value => validator(value, {email: true, var: `"${value}"`})
      },

      {
        name: 'customizer.setting.default',
        message: 'Default Value',
        default: 'http://example.com',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.URL,
        validate: value => validator(value, {url: true, var: `"${value}"`})
      },

      {
        name: 'customizer.setting.default',
        message: 'Default Color',
        default: '#ffffff',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.COLOR_PICKER,
        validate: value => validator(value, {color: true, var: `"${value}"`})
      },

      {
        name: 'customizer.control.input_attrs.min',
        message: 'Minimum Value',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.RANGE,
        validate: value => validator(value, {number: true})
      },

      {
        name: 'customizer.control.input_attrs.max',
        message: 'Maximum Value',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.RANGE,
        validate: value => validator(value, {number: true})
      },

      {
        name: 'customizer.control.input_attrs.step',
        message: 'Step Value',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.RANGE,
        validate: value => validator(value, {number: true})
      },

      {
        type: 'confirm',
        name: 'customizer.control.flex_width',
        message: 'Allow flexible width?',
        default: true,
        when: ({customizer}) => customizer.control.type === customizerControlTypes.IMAGE_PICKER
      },

      {
        type: 'confirm',
        name: 'customizer.control.flex_height',
        message: 'Allow flexible height?',
        default: true,
        when: ({customizer}) => customizer.control.type === customizerControlTypes.IMAGE_PICKER
      },

      {
        name: 'customizer.control.width',
        message: 'Image width in px',
        default: 2000,
        when: ({customizer}) => customizer.control.type === customizerControlTypes.IMAGE_PICKER,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        name: 'customizer.control.height',
        message: 'Image height in px',
        default: 1200,
        when: ({customizer}) => customizer.control.type === customizerControlTypes.IMAGE_PICKER,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        name: 'customizer.customControl.name',
        message: 'Custom Control Name',
        default: 'New Control',
        when: ({customizer}) => customizer.control.type === customizerControlTypes.CUSTOM,
        validate: value => validator(value, {minimum: 1, var: `"${value}"`})
      },

      {
        name: 'customizer.customControl.description',
        message: 'Custom Control Description',
        default: faker.lorem.words(),
        when: ({customizer}) => customizer.control.type === customizerControlTypes.CUSTOM,
        validate: value => validator(value, {minimum: 2, words: true, var: 'Custom control description'})
      },

      {
        type: 'list',
        name: 'customizer.control.section',
        message: ({customizer}) => {
          return `Where is "${customizer.setting.name}" setting will be displayed?`
        },
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const key in customizerSectionTypes) {
            if (Object.prototype.hasOwnProperty.call(customizerSectionTypes, key) && customizerSectionTypes[key] !== customizerSectionTypes.CUSTOM) {
              list.push({
                name: customizerSectionLabels[key],
                value: customizerSectionTypes[key]
              })
            }
          }

          const definedSections = []
          for (const key in this.customizer.sections) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.sections, key)) {
              definedSections.push({
                name: getL10n(this.customizer.sections[key].title.___$string),
                value: key
              })
            }
          }

          if (definedSections.length > 0) {
            list = list.concat(definedSections)
          }

          list.push(new inquirer.Separator())
          list.push({
            name: customizerSectionLabels.CUSTOM,
            value: customizerSectionTypes.CUSTOM
          })

          resolve(list)
        })
      },

      {
        name: 'customizer.section.title',
        message: 'New Section Label',
        default: 'New Section',
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM,
        validate: value => validator(value, {minimum: 3, var: 'Section Label'})
      },

      {
        name: 'customizer.section.description',
        message: 'New Section Description',
        default: faker.lorem.words(),
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM,
        validate: value => validator(value, {minimum: 3, var: 'Section Label'})
      },

      {
        name: 'customizer.section.priority',
        message: 'New Section Priority',
        default: 160,
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM,
        validate: value => validator(value, {minimum: 1, number: true, var: 'Section priority'})
      },

      {
        type: 'confirm',
        name: 'customizer.section.inPanel',
        default: false,
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM,
        message: ({customizer}) => {
          return `Is "${customizer.section.title}" section will be displayed inside a panel?`
        }
      },

      {
        type: 'list',
        name: 'customizer.section.panel',
        message: 'Choose Panel',
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM && customizer.section.inPanel,
        choices: () => new Promise(resolve => {
          let list = [new inquirer.Separator()]

          for (const key in customizerPanelTypes) {
            if (Object.prototype.hasOwnProperty.call(customizerPanelTypes, key) && customizerPanelTypes[key] !== customizerPanelTypes.CUSTOM) {
              list.push({
                name: customizerPanelLabels[key],
                value: customizerPanelTypes[key]
              })
            }
          }

          const definedPanels = []
          for (const key in this.customizer.panels) {
            if (Object.prototype.hasOwnProperty.call(this.customizer.panels, key)) {
              definedPanels.push({
                name: getL10n(this.customizer.panels[key].title.___$string),
                value: key
              })
            }
          }

          if (definedPanels.length > 0) {
            list = list.concat(definedPanels)
          }

          list.push(new inquirer.Separator())
          list.push({
            name: customizerPanelLabels.CUSTOM,
            value: customizerPanelTypes.CUSTOM
          })

          resolve(list)
        })
      },

      {
        name: 'customizer.panel.title',
        message: 'New Panel Label',
        default: 'New Panel',
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM && customizer.section.inPanel && customizer.section.panel === customizerPanelTypes.CUSTOM,
        validate: value => validator(value, {minimum: 3, var: 'Panel label'})
      },

      {
        name: 'customizer.panel.description',
        message: 'New Panel Description',
        default: faker.lorem.words(),
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM && customizer.section.inPanel && customizer.section.panel === customizerPanelTypes.CUSTOM,
        validate: value => validator(value, {minimum: 2, word: true, var: 'Panel description'})
      },

      {
        name: 'customizer.panel.priority',
        message: 'New Panel Priority',
        default: 160,
        when: ({customizer}) => customizer.control.section === customizerSectionTypes.CUSTOM && customizer.section.inPanel && customizer.section.panel === customizerPanelTypes.CUSTOM,
        validate: value => validator(value, {minimum: 1, number: true, var: 'Section priority'})
      }
    ]
  }

  action({customizer}) {
    const themeDetails = this.themeDetails()
    const settingId = slugify(customizer.setting.name, {replacement: '_'})
    const controlId = `${settingId}_control`
    let sectionId
    let panelId

    // Add customizer panel if section placement is in new panel.
    if (customizer.control.section === customizerSectionTypes.CUSTOM && customizer.section.inPanel) {
      panelId = customizer.section.panel

      if (customizer.section.panel === customizerPanelTypes.CUSTOM) {
        panelId = slugify(customizer.panel.title, {replacement: '_'})
        this.customizer.panels[panelId] = {
          title: jsonar.literal(`__( '${customizer.panel.title}', '${themeDetails.slug}' )`),
          description: jsonar.literal(`__( '${customizer.panel.description}', '${themeDetails.slug}' )`),
          priority: customizer.panel.priority
        }
      }
    }

    // Add customizer section if control placement is in new section.
    if (customizer.control.section === customizerSectionTypes.CUSTOM) {
      sectionId = slugify(customizer.section.title, {replacement: '_'})
      /* eslint-disable camelcase */
      const newSection = {
        title: jsonar.literal(`__( '${customizer.section.title}', '${themeDetails.slug}' )`),
        description_hidden: true,
        description: jsonar.literal(`__( '${customizer.section.description}', '${themeDetails.slug}' )`),
        priority: customizer.section.priority
      }
      /* eslint-enable */

      if (panelId) {
        newSection.panel = panelId
        delete customizer.section.inPanel
      }

      this.customizer.sections[sectionId] = newSection
    }

    // Add customizer control.
    const newControl = {
      settings: settingId,
      label: jsonar.literal(`__( '${customizer.setting.name}', '${themeDetails.slug}' )`),
      description: jsonar.literal(`__( '${customizer.control.description}', '${themeDetails.slug}' )`),
      type: customizer.control.type,
      section: sectionId || customizer.control.section
    }

    // Control type radiobox, checkbox, select dropdown.
    if (Array.isArray(customizer.control.choices) && customizer.control.choices.length > 0) {
      newControl.choices = {}
      customizer.control.choices.forEach(item => {
        newControl.choices[slugify(item)] = jsonar.literal(`__( '${item}', '${themeDetails.slug}' )`)
      })
    }

    /* eslint-disable camelcase */
    // Customizer custom control.
    let customControl

    if (customizer.customControl) {
      const controlSlug = slugify(customizer.customControl.name)
      const controlClassName = controlSlug.split('-').map(item => capitalize(item)).join('_')

      customControl = {
        slug: controlSlug,
        slugfn: slugify(customizer.customControl.name, {replacement: '_'}),
        name: customizer.customControl.name,
        description: capitalize(customizer.customControl.description),
        filename: `class-wp-customize-${controlSlug}-control`,
        className: `WP_Customize_${controlClassName}_Control`
      }

      newControl.custom_control = controlSlug
      this.customizer.control_types[controlSlug] = customControl.className
    }

    // Add additional attributes
    if (customizer.control.input_attrs) {
      newControl.input_attrs = customizer.control.input_attrs
    }

    if (customizer.control.flex_width) {
      newControl.flex_width = customizer.control.flex_width
    }

    if (customizer.control.flex_height) {
      newControl.flex_height = customizer.control.flex_height
    }

    if (customizer.control.width) {
      newControl.width = customizer.control.width
    }

    if (customizer.control.height) {
      newControl.height = customizer.control.height
    }

    /* eslint-enable */
    this.customizer.controls[controlId] = newControl

    // Add customizer setting.
    delete customizer.setting.name
    if (customizer.control.type === customizerControlTypes.PAGES_DROPDOWN) {
      customizer.setting.default = 0
    }
    this.customizer.settings[settingId] = customizer.setting

    Promise.all([
      new Promise(resolve => {
        if (!customControl) {
          return resolve()
        }

        compileFile({
          srcPath: this.templateSourcePath('_partials', 'control.php'),
          dstPath: this.currentThemePath('includes', 'customizer', 'controls', `${customControl.filename}.php`),
          syntax: {
            theme: themeDetails,
            control: customControl
          }
        })

        resolve()
      }),

      new Promise(resolve => {
        if (!customControl) {
          return resolve()
        }

        compileFile({
          srcPath: this.templateSourcePath('_partials', 'sass.scss'),
          dstPath: this.currentThemePath('includes', 'customizer', 'assets-src', 'sass', 'controls', `_${customControl.slug}.scss`),
          syntax: {
            sass: {
              description: customControl.description
            }
          }
        })

        resolve()
      }),

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
      }),

      new Promise(resolve => {
        if (!customControl) {
          return resolve()
        }

        compileFile({
          srcPath: this.templateSourcePath('_partials', 'script.js'),
          dstPath: this.currentThemePath('includes', 'customizer', 'assets-src', 'js', 'controls', `${customControl.slug}.js`),
          syntax: {
            js: {
              description: 'Your codes'
            }
          }
        })
        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          customizer: this.customizer
        })
        resolve()
      })
    ]).then(
      this.$logger.finish(message.SUCCEED_CUSTOMIZER_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddCustomizer
