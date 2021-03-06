const path = require('path')
const {statSync} = require('fs')
const rimraf = require('rimraf')
const slugify = require('node-slugify')
const chalk = require('chalk')
const wpFileHeader = require('wp-get-file-header')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {templateTypes} = global.deuxcmd.require('add/cli/fixtures')
const {scandir, dirlist, filelist} = global.deuxhelpers.require('util/file')
const {capitalize} = global.deuxhelpers.require('util/misc')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveTemplate extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup remove template prompts
   */
  prepare() {
    this.$title = 'Remove {Templates}'
    this.$prompts = [{}]
  }

  /**
   * Hook before real action.
   */
  beforeAction() {
    return new Promise(resolve => {
      Promise.all([
        // Page templates.
        new Promise((resolve, reject) => {
          const pageTemplates = scandir(this.currentThemePath('page-templates'))
          Promise.all(pageTemplates.map(
            file => new Promise((resolve, reject) => {
              wpFileHeader(this.currentThemePath('page-templates', file)).then(info => {
                if (info.templateName) {
                  resolve({
                    name: info.templateName,
                    value: {
                      type: templateTypes.PAGE,
                      file
                    }
                  })
                } else {
                  resolve()
                }
              }).catch(reject)
            })
          )).then(templates => {
            templates = templates.filter(item => item)
            resolve(templates)
          }).catch(reject)
        }),

        // Partial templates.
        new Promise((resolve, reject) => {
          let partialTemplates = []

          dirlist(this.currentThemePath('partial-templates'))
            .map(
              dir => filelist(this.currentThemePath('partial-templates', dir)).map(file => {
                return {file, dir}
              })
            )
            .forEach(item => {
              partialTemplates = partialTemplates.concat(item)
            })

          Promise.all(partialTemplates.map(
            item => new Promise((resolve, reject) => {
              wpFileHeader(this.currentThemePath('partial-templates', item.dir, item.file))
              .then(info => {
                if (info.partialTemplateName) {
                  resolve({
                    name: `${item.dir}: ${info.partialTemplateName}`,
                    value: {
                      type: templateTypes.PARTIAL,
                      file: item.file,
                      dir: item.dir
                    }
                  })
                } else {
                  resolve()
                }
              }).catch(reject)
            })
          )).then(templates => {
            templates = templates.filter(item => item)
            resolve(templates)
          }).catch(reject)
        }),

        // Woocommerce templates.
        new Promise(resolve => {
          if (!this.themeInfo('features').woocommerce) {
            resolve()
          }

          const scanTemplates = (dir = []) => {
            let templates = []
            const woocommerceDir = ['woocommerce'].concat(dir)
            const files = scandir(this.currentThemePath(woocommerceDir))

            files.forEach(value => {
              const basename = path.basename(value, path.extname(value))
              const label = slugify(basename, {replacement: ' '})
                .replace(/cat$/, 'category')
                .replace(/cats$/, 'categories')
              const name = capitalize(label)

              if (statSync(this.currentThemePath(woocommerceDir.concat(value))).isFile()) {
                templates.push({
                  name: `${name} (${chalk.green(path.join(...woocommerceDir.concat(value)))})`,
                  value: {
                    type: templateTypes.WOOCOMMERCE,
                    file: woocommerceDir.concat(value)
                  }
                })
              } else {
                templates = templates.concat(scanTemplates(dir.concat(value)))
              }
            })

            return templates
          }

          resolve(scanTemplates())
        })
      ]).then(templates => {
        if (templates.length === 0) {
          this.$logger.happyExit()
        }

        const [
          pageTemplates,
          partialTemplates,
          wooTemplates
        ] = templates

        this.$prompts = [
          {
            type: 'checkbox',
            name: 'templates',
            message: 'Select templates you want to remove',
            choices: () => new Promise(resolve => {
              let list = []

              if (pageTemplates.length > 0) {
                list = list.concat(separatorMaker('Page Templates').concat(pageTemplates))
              }

              if (partialTemplates.length > 0) {
                list = list.concat(separatorMaker('Partial Templates').concat(partialTemplates))
              }

              if (wooTemplates && wooTemplates.length > 0) {
                list = list.concat(separatorMaker('WooCommerce Templates').concat(wooTemplates))
              }

              resolve(list)
            })
          },

          Object.assign(captchaMaker(), {
            when: ({templates}) => templates.length > 0
          }),

          {
            type: 'confirm',
            name: 'confirm',
            when: ({templates, captcha}) => templates.length > 0 && captcha,
            default: false,
            message: () => 'Removing template\'s files and config can\'t be undone. Do you want to continue?'
          }
        ]

        resolve()
      }).catch(this.$logger.exit)
    })
  }

  /**
   * Remove template files and config
   *
   * @param {Object} {templates, confirm}
   */
  action({templates, confirm}) {
    if (templates.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(templates.map(
      item => new Promise(resolve => {
        switch (item.type) {
          case templateTypes.PAGE:
            rimraf.sync(this.currentThemePath('page-templates', item.file))
            break

          case templateTypes.PARTIAL:
            rimraf.sync(this.currentThemePath('partial-templates', item.dir, item.file))
            break

          case templateTypes.WOOCOMMERCE:
            rimraf.sync(this.currentThemePath(item.file))
            break

          default: break
        }
        resolve()
      })
    )).then(() => {
      this.$logger.finish(messages.SUCCEED_REMOVED_TEMPLATE)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveTemplate
