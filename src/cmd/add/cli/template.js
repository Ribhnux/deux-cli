const path = require('path')
const {existsSync, statSync} = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')
const faker = require('faker')
const slugify = require('node-slugify')
const mkdirp = require('mkdirp')
const {templateTypes, templateLabels, postTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFiles = global.deuxhelpers.require('compiler/bulk')
const {scandir, dirlist} = global.deuxhelpers.require('util/file')
const {capitalize} = global.deuxhelpers.require('util/misc')
const {separatorMaker} = global.deuxhelpers.require('util/cli')

class AddTemplate extends CLI {
  constructor(options) {
    super()
    this.woocommerce = undefined
    this.init(options)
  }

  /**
   * Helpers
   */
  tplDir(template) {
    return template.dir === '$newdir' ? template.newdir : template.dir
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
        type: 'list',
        name: 'template.dir',
        message: 'Template Directory',
        when: ({template}) => template.type === templateTypes.PARTIAL,
        choices: () => new Promise(resolve => {
          const _dirlist = dirlist(this.currentThemePath('partial-templates'))
          let list = []

          if (_dirlist.length > 0) {
            list.push(new inquirer.Separator())
            list = list.concat(_dirlist)
            list.push(new inquirer.Separator())
          }

          list.push({
            name: 'New Directory',
            value: '$newdir'
          })

          resolve(list)
        })
      },

      {
        name: 'template.newdir',
        message: 'Directory Name',
        when: ({template}) => template.type === templateTypes.PARTIAL && template.dir === '$newdir',
        validate: value => validator(value, {minimum: 3, slug: true, var: `"${value}"`})
      },

      {
        name: 'template.name',
        message: 'Template Name',
        when: ({template}) => template.type !== templateTypes.WOOCOMMERCE,
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
          if (template.type === templateTypes.WOOCOMMERCE) {
            return resolve(false)
          }

          const slug = slugify(template.name)
          let filepath

          if (template.type === templateTypes.PAGE) {
            filepath = this.currentThemePath('page-templates', `${slug}.php`)
          } else if (template.type === templateTypes.PARTIAL) {
            filepath = this.currentThemePath('partial-templates', this.tplDir(template), `${slug}.php`)
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
    let srcDir = this.templateSourcePath('_partials')
    let files
    let dstDir
    let rename
    let successMsg

    template.slug = slugify(template.name)

    switch (template.type) {
      case templateTypes.PARTIAL:
        dstDir = this.currentThemePath('partial-templates', this.tplDir(template))
        files = ['partial-template.php']
        successMsg = messages.SUCCEED_PARTIAL_TEMPLATE_ADDED
        rename = {
          'partial-template.php': `${template.slug}.php`
        }
        break

      case templateTypes.PAGE:
        dstDir = this.currentThemePath('page-templates')
        files = ['page-template.php']
        successMsg = messages.SUCCEED_PAGE_TEMPLATE_ADDED
        rename = {
          'page-template.php': `${template.slug}.php`
        }
        break

      case templateTypes.WOOCOMMERCE:
        srcDir = this.templateSourcePath('_partials', 'woocommerce')
        dstDir = this.currentThemePath('woocommerce')
        files = template.woocommerce.map(item => path.join(...item))
        successMsg = messages.SUCCEED_WOOCOMMERCE_TEMPLATE_ADDED
        break

      default: break
    }

    Promise.all([
      new Promise(resolve => {
        mkdirp.sync(dstDir)
        resolve()
      }),

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
