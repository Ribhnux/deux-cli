const path = require('path')
const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')
const {colorlog, done, error, exit} = global.helpers.require('logger')
const compileFile = global.helpers.require('compiler/single')

module.exports = db => {
  colorlog('Add {Helper} (PHP Function)')

  const prompts = [
    {
      name: 'helper.name',
      message: 'Helper Name',
      default: 'New Function',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'helper.description',
      message: 'Helper Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'helper.overwrite',
      message: 'Helper already exists. Continue to overwrite?',
      default: true,
      when: ({helper}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.helpers.includes(slugify(helper.name)))
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({helper}) => {
    getCurrentTheme(db).then(theme => {
      if (helper.overwrite === false) {
        error({
          message: message.ERROR_HELPER_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      helper.slugfn = slugify(helper.name, {replacement: '_'})
      helper.slug = slugify(helper.name)
      theme.helpers = theme.helpers.concat(helper.slug)

      const themePath = path.join(wpThemeDir, theme.details.slug)
      const helperPath = path.join(themePath, 'includes', 'helpers', `${helper.slug}.php`)

      compileFile({
        srcPath: path.join(global.templates.path, '_partials', 'helper.php'),
        dstPath: helperPath,
        syntax: {
          theme: theme.details,
          helper
        }
      })

      saveConfig(db, {
        helpers: uniq(theme.helpers)
      }).then(() => {
        done({
          message: message.SUCCEED_HELPER_ADDED,
          padding: true,
          exit: true
        })
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
