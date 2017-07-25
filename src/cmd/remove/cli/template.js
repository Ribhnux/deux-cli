const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {templateTypes} = global.commands.require('add/cli/const')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done, exit} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

const getTemplateInfo = (items, type, templatePath) => new Promise((resolve, reject) => {
  Promise.all(items.map(
    value => new Promise((resolve, reject) => {
      wpFileHeader(path.join(templatePath, `${value}.php`)).then(info => {
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

module.exports = db => {
  colorlog('Remove {Templates}')

  getCurrentTheme(db).then(theme => {
    const pageTemplatePath = path.join(wpThemeDir, theme.details.slug, 'page-templates')
    const partialTemplatePath = path.join(wpThemeDir, theme.details.slug, 'partial-templates')

    const prompts = [
      {
        type: 'checkbox',
        name: 'templates',
        message: 'Select templates you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all([
            getTemplateInfo(theme.pageTemplates, templateTypes.PAGE, pageTemplatePath),
            getTemplateInfo(theme.partialTemplates, templateTypes.PARTIAL, partialTemplatePath)
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

    const pageTotal = theme.pageTemplates.length
    const partialTotal = theme.partialTemplates.length
    const templateTotal = pageTotal + partialTotal

    if (templateTotal === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({templates, confirm}) => {
      if (templates.length === 0 || !confirm) {
        happyExit()
      }

      Promise.all(templates.map(
        item => new Promise(resolve => {
          if (item.type === templateTypes.PAGE) {
            rimraf.sync(path.join(pageTemplatePath, `${item.value}.php`))
            theme.pageTemplates = theme.pageTemplates.filter(_item => _item !== item.value)
          } else {
            rimraf.sync(path.join(partialTemplatePath, `${item.value}.php`))
            theme.partialTemplates = theme.partialTemplates.filter(_item => _item !== item.value)
          }
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          pageTemplates: uniq(theme.pageTemplates),
          partialTemplates: uniq(theme.partialTemplates)
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_PLUGIN,
            padding: true,
            exit: true
          })
        }).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
