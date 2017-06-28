const path = require('path')
const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')

const validator = global.helpers.require('util/validator')
const {error, done, colorlog} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')
const compileFile = global.helpers.require('compiler/single')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')

module.exports = db => {
  colorlog('Add a {New Component}')
  const prompts = [
    {
      name: 'component.name',
      message: 'Name',
      default: 'New Component',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'component.description',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'component.overwrite',
      message: 'Component already exists. Continue to overwrite?',
      default: true,
      when: ({component}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.components.includes(slugify(component.name)))
        }).catch(reject)
      })
    }
  ]

  inquirer.prompt(prompts).then(({component}) => {
    getCurrentTheme(db).then(theme => {
      if (component.overwrite === false) {
        error({
          message: message.ERROR_COMPONENT_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      component.slug = slugify(component.name)
      component.slugfn = slugify(component.name, {replacement: '_'})

      const themePath = path.join(wpThemeDir, theme.details.slug)
      const componentPath = path.join(themePath, 'components', `${component.slug}.php`)

      compileFile({
        srcPath: path.join(global.templates.path, '_partials', 'component.php'),
        dstPath: componentPath,
        syntax: {
          theme: theme.details,
          component
        }
      })

      theme.components = theme.components
        .filter(item => item !== component.slug)
        .concat(component.slug)

      saveConfig(db, {
        components: theme.components
      }).then(() => {
        done({
          message: message.SUCCEED_COMPONENT_ADDED,
          padding: true,
          exit: true
        })
      })
    })
  })
}
