const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {templateTypes} = global.deuxcmd.require('add/cli/const')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveTemplate extends CLI {
  constructor() {
    super()
    this.pageTemplates = undefined
    this.partialTemplates = undefined
    this.init()
  }

  /**
   * Setup remove template prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.pageTemplates = themeInfo.pageTemplates
    this.partialTemplates = themeInfo.partialTemplates

    if ((this.pageTemplates.length + this.partialTemplates.length) === 0) {
      happyExit()
    }

    const getTemplateInfo = (items, type) => new Promise((resolve, reject) => {
      Promise.all(items.map(
        value => new Promise((resolve, reject) => {
          wpFileHeader(this.themePath([this.themeDetails('slug'), `${type}-templates`, `${value}.php`]))
          .then(info => {
            resolve({
              name: info.templateName,
              value: {
                type,
                value
              }
            })
          }).catch(reject)
        })
      )).then(items => {
        resolve({
          type,
          items
        })
      }).catch(reject)
    })

    this.title = 'Remove {Templates}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'templates',
        message: 'Select templates you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all([
            getTemplateInfo(this.pageTemplates, templateTypes.PAGE),
            getTemplateInfo(this.partialTemplates, templateTypes.PARTIAL)
          ]).then(templates => {
            let list = []
            let pageList = []
            let partialList = []

            templates.forEach(template => {
              switch (template.type) {
                case templateTypes.PAGE:
                  pageList = template.items
                  break

                case templateTypes.PARTIAL:
                  partialList = template.items
                  break

                default: break
              }
            })

            if (pageList.length > 0) {
              list = list.concat(separatorMaker('Page Templates').concat(pageList))
            }

            if (partialList.length > 0) {
              list = list.concat(separatorMaker('Partial Templates').concat(partialList))
            }

            resolve(list)
          }).catch(reject)
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
  }

  /**
   * Remove template files and config
   *
   * @param {Object} {templates, confirm}
   */
  action({templates, confirm}) {
    if (templates.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(templates.map(
      item => new Promise(resolve => {
        const themeDetails = this.themeDetails()

        if (item.type === templateTypes.PAGE) {
          rimraf.sync(this.themePath([themeDetails.slug, `${templateTypes.PAGE}-templates`, `${item.value}.php`]))
          this.pageTemplates = this.pageTemplates.filter(_item => _item !== item.value)
        } else {
          rimraf.sync(this.themePath([themeDetails.slug, `${templateTypes.PARTIAL}-templates`, `${item.value}.php`]))
          this.partialTemplates = this.partialTemplates.filter(_item => _item !== item.value)
        }
        resolve()
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            pageTemplates: uniq(this.pageTemplates),
            partialTemplates: uniq(this.partialTemplates)
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_TEMPLATE)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveTemplate
