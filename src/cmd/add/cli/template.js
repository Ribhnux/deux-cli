const path = require('path')
const {existsSync, statSync} = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const faker = require('faker')
const slugify = require('node-slugify')
const {templateTypes, templateLabels, postTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFiles = global.deuxhelpers.require('compiler/bulk')
const {scandir} = global.deuxhelpers.require('util/file')
const {capitalize} = global.deuxhelpers.require('util/misc')
const {separatorMaker} = global.deuxhelpers.require('util/cli')

const slugifyName = (prefix, name) => {
  let slug = slugify(prefix)

  if (name.length > 0) {
    slug += '-' + slugify(name)
  }

  return slug
}

class AddTemplate extends CLI {
  constructor(options) {
    super()
    this.woocommerce = undefined
    this.init(options)
  }

  /**
   * Setup add template prompts
   */
  prepare() {
    this.woocommerce = this.themeInfo('features').woocommerce
    this.$title = 'Add {New Template}'
    this.$prompts = [
      {
        type: 'list',
        name: 'template.type',
        message: 'Select template type',
        choices: () => new Promise(resolve => {
          let list = []

          for (const key in templateTypes) {
            if (Object.prototype.hasOwnProperty.call(templateTypes, key)) {
              list.push({
                name: templateLabels[key],
                value: templateTypes[key]
              })
            }
          }

          list = list.filter(item => {
            if (item.value === templateTypes.WOOCOMMERCE) {
              return this.woocommerce
            }

            return true
          })

          resolve(list)
        })
      },

      {
        name: 'template.name',
        message: 'Template Name',
        when: ({template}) => template.type === templateTypes.PAGE,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        type: 'list',
        name: 'template.posttype',
        message: 'Post Type',
        when: ({template}) => template.type === templateTypes.PAGE,
        choices: [
          {
            value: postTypes.POST,
            name: 'Post'
          },
          {
            value: postTypes.PAGE,
            name: 'Page'
          },
          new inquirer.Separator(),
          {
            value: postTypes.CUSTOM,
            name: 'Other (specify)'
          }
        ]
      },

      {
        name: 'template.posttype',
        message: 'Custom Post Type',
        default: postTypes.POST,
        when: ({template}) => {
          return template.type === templateTypes.PAGE && template.posttype === postTypes.CUSTOM
        },
        validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
        filter: value => value.split(',').map(item => slugify(item.trim().toLowerCase())).join(', ')
      },

      {
        name: 'template.prefix',
        message: 'Template Prefix',
        when: ({template}) => template.type === templateTypes.PARTIAL,
        validate: value => validator(value, {minimum: 3, slug: true, var: `"${value}"`})
      },

      {
        name: 'template.name',
        message: 'Template Name [optional]',
        when: ({template}) => template.type === templateTypes.PARTIAL
      },

      {
        name: 'template.description',
        message: 'Description',
        default: faker.lorem.sentence(),
        when: ({template}) => template.type !== templateTypes.WOOCOMMERCE,
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        type: 'checkbox',
        name: 'template.woocommerce',
        message: 'WooCommerce Template',
        validate: value => validator(value, {minimum: 1, array: true, var: 'Template'}),
        when: ({template}) => template.type === templateTypes.WOOCOMMERCE,
        choices: () => new Promise(resolve => {
          const subtemplates = []
          const scanTemplates = (dir = []) => {
            const templates = []
            const woocommerceDir = ['_partials', 'woocommerce'].concat(dir)
            const files = scandir(this.templateSourcePath(woocommerceDir))

            files.forEach(value => {
              const basename = path.basename(value, path.extname(value))
              const label = slugify(basename, {replacement: ' '})
                .replace(/cat$/, 'category')
                .replace(/cats$/, 'categories')
              const name = capitalize(label)

              if (statSync(this.templateSourcePath(woocommerceDir.concat(value))).isFile()) {
                if (!existsSync(this.currentThemePath('woocommerce', dir.concat(value)))) {
                  templates.push({
                    name: `${name} (${chalk.green(value)})`,
                    value: dir.concat(value)
                  })
                }
              } else {
                const subdir = dir.concat(value)
                subtemplates.push({
                  label: separatorMaker(`${name} (woocommerce/templates/${chalk.green(subdir.join('/'))})`),
                  items: scanTemplates(dir.concat(value))
                })
              }
            })

            return templates
          }

          const scannedTemplates = scanTemplates()
          let list = []

          if (Object.keys(scannedTemplates).length > 0) {
            list = list.concat(separatorMaker('Basic'))
            list = list.concat(scannedTemplates)
          }

          subtemplates.forEach(item => {
            if (Object.keys(item.items).length > 0) {
              list = list.concat(item.label)
              list = list.concat(item.items)
            }
          })

          resolve(list)
        })
      },

      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Template already exists. Continue to overwrite?',
        default: true,
        when: ({template}) => new Promise(resolve => {
          let slug = slugify(template.name)
          let filepath

          if (template.type === templateTypes.PAGE) {
            filepath = this.currentThemePath('page-templates', `${slug}.php`)
          } else if (template.type === templateTypes.PARTIAL) {
            slug = slugifyName(template.prefix, template.name)
            filepath = this.currentThemePath('partial-templates', `${slug}.php`)
          } else {
            return resolve(false)
          }

          return resolve(existsSync(filepath))
        })
      }
    ]
  }

  /**
   * Compile template file and config
   * @param {Object} {template, overwrite}
   */
  action({template, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_TEMPLATE_ALREADY_EXISTS)
    }

    const themeDetails = this.themeDetails()
    let files
    let srcDir = this.templateSourcePath('_partials')
    let dstDir
    let rename
    let successMsg

    if (template.type === templateTypes.PARTIAL) {
      template.slug = slugifyName(template.prefix, template.name)
      if (template.name.length === 0) {
        template.name = template.prefix
      }
      files = ['partial-template.php']
      dstDir = this.currentThemePath('partial-templates')
      rename = {
        'partial-template.php': `${template.slug}.php`
      }
      successMsg = messages.SUCCEED_PARTIAL_TEMPLATE_ADDED
    }

    if (template.type === templateTypes.PAGE) {
      template.slug = slugify(template.name)
      files = ['page-template.php']
      dstDir = this.currentThemePath('page-templates')
      rename = {
        'page-template.php': `${template.slug}.php`
      }
      successMsg = messages.SUCCEED_PAGE_TEMPLATE_ADDED
    }

    if (template.type === templateTypes.WOOCOMMERCE) {
      srcDir = this.templateSourcePath('_partials', 'woocommerce')
      dstDir = this.currentThemePath('woocommerce')
      files = template.woocommerce.map(item => path.join(...item))
      successMsg = messages.SUCCEED_WOOCOMMERCE_TEMPLATE_ADDED
    }

    Promise.all([
      new Promise(resolve => {
        compileFiles({
          includes: files,
          srcDir,
          dstDir,
          rename,
          syntax: {
            theme: themeDetails,
            template
          }
        })

        resolve()
      })
    ]).then(
      this.$logger.finish(successMsg)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddTemplate
