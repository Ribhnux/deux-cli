const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const uniq = require('lodash.uniq')
const wpFileHeader = require('wp-get-file-header')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {templateTypes} = global.commands.require('add/cli/const')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

const getTemplateInfo = (items, type, templatePath) => new Promise(resolve => {
  Promise.all(items.map(
    value => new Promise(resolve => {
      wpFileHeader(path.join(templatePath, `${value}.php`)).then(info => {
        resolve({
          name: info.templateName,
          value: {
            type,
            value
          }
        })
      })
    })
  )).then(items => {
    resolve({
      type,
      items
    })
  })
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
        choices: () => new Promise(resolve => {
          Promise.all([
            getTemplateInfo(theme.template.pages, templateTypes.PAGE, pageTemplatePath),
            getTemplateInfo(theme.template.partials, templateTypes.PARTIAL, partialTemplatePath)
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
              }
            })

            if (pageList.length > 0) {
              list = list.concat(separatorMaker('Page Templates').concat(pageList))
            }

            if (partialList.length > 0) {
              list = list.concat(separatorMaker('Partial Templates').concat(partialList))
            }

            resolve(list)
          })
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

    const pageTotal = theme.template.pages.length
    const partialTotal = theme.template.partials.length
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
          const templatePath = item.type === templateTypes.PAGE ? pageTemplatePath : partialTemplatePath
          rimraf.sync(path.join(templatePath, `${item.value}.php`))
          theme.template[`${item.type}s`] = theme.template[`${item.type}s`].filter(_item => _item !== item.value)
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          template: {
            [`${templateTypes.PAGE}s`]: uniq(theme.template.pages),
            [`${templateTypes.PARTIAL}s`]: uniq(theme.template.partials)
          }
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_PLUGIN,
            padding: true,
            exit: true
          })
        })
      })
    })
  })
}
