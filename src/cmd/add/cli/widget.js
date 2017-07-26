const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const jsonar = require('jsonar')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const {colorlog, exit, finish} = global.helpers.require('logger')

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
    },

    {
      type: 'confirm',
      name: 'widget.overwrite',
      message: 'Widget already exists. Continue to overwrite?',
      default: true,
      when: ({widget}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.widgets[slugify(widget.name)] !== undefined)
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({widget}) => {
    getCurrentTheme(db).then(theme => {
      if (widget.overwrite === false) {
        exit(message.ERROR_WIDGET_ALREADY_EXISTS)
      }

      /* eslint-disable camelcase, quotes */
      theme.widgets[slugify(widget.name)] = {
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
      }).then(finish(message.SUCCEED_WIDGET_ADDED)).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
