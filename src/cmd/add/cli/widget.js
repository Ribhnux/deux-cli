const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const jsonar = require('jsonar')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const {colorlog, done, error} = global.helpers.require('logger')

module.exports = db => {
  colorlog('Register {New Widget}')

  const prompts = [
    {
      name: 'widget.name',
      message: 'Widget Name',
      default: 'New Widget',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'widget.description',
      message: 'Widget Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]

  return inquirer.prompt(prompts).then(({widget}) => {
    getCurrentTheme(db).then(theme => {
      const widgetId = slugify(widget.name)

      if (theme.widgets[widgetId]) {
        error({
          message: message.ERROR_WIDGET_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      /* eslint-disable camelcase, quotes */
      theme.widgets[widgetId] = {
        name: jsonar.literal(`__( '${widget.name}', '${theme.details.slug}' )`),
        description: jsonar.literal(`__( '${widget.description}', '${theme.details.slug}' )`),
        class: '',
        before_widget: jsonar.literal(`'<section id="%1$s" class="widget %2$s">'`),
        after_widget: jsonar.literal(`'</section>'`),
        before_title: jsonar.literal(`'<h2 class="widget-title">'`),
        after_title: jsonar.literal(`'</h2>'`)
      }
      /* eslint-enable */

      saveConfig(db, {
        widgets: theme.widgets
      }).then(() => {
        done({
          message: message.SUCCEED_WIDGET_ADDED,
          padding: true,
          exit: true
        })
      })
    })
  })
}
