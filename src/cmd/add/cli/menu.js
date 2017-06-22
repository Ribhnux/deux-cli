const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const jsonar = require('jsonar')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const {colorlog, done, error} = global.helpers.require('logger')

module.exports = db => {
  colorlog('Register {New Menu}')

  const prompts = [
    {
      name: 'menu.location',
      message: 'Menu Location',
      default: 'primary',
      validate: value => validator(value, {slug: true, slugPattern: '[a-z0-9_]+', var: 'Menu Location'})
    },

    {
      name: 'menu.description',
      message: 'Menu Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]

  return inquirer.prompt(prompts).then(({menu}) => {
    getCurrentTheme(db).then(theme => {
      const menuLocation = slugify(menu.location)

      if (theme.menus[menuLocation]) {
        error({
          message: message.ERROR_MENU_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      theme.menus[menuLocation] = jsonar.literal(`__( '${menu.description}', '${theme.details.slug}' )`)

      saveConfig(db, {
        menus: theme.menus
      }).then(() => {
        done({
          message: message.SUCCEED_MENU_ADDED,
          padding: true,
          exit: true
        })
      })
    })
  })
}
