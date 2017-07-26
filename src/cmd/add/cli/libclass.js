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
const {capitalize} = global.helpers.require('util/misc')

module.exports = db => {
  colorlog('Add PHP Library')

  const prompts = [
    {
      name: 'lib.name',
      message: 'Library name',
      default: 'New Library',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      name: 'lib.description',
      message: 'PHP library description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    },

    {
      type: 'confirm',
      name: 'lib.overwrite',
      message: 'PHP library already exists. Continue to overwrite?',
      default: true,
      when: ({lib}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.libraries.includes(`class-${slugify(lib.name)}`))
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({lib}) => {
    getCurrentTheme(db).then(theme => {
      if (lib.overwrite === false) {
        error({
          message: message.ERROR_LIBCLASS_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      const slug = slugify(lib.name)
      lib.slug = `class-${slug}`
      lib.className = slug.split('-').map(item => capitalize(item)).join('_')
      theme.libraries = theme.libraries.concat(lib.slug)

      const themePath = path.join(wpThemeDir, theme.details.slug)
      const libPath = path.join(themePath, 'includes', 'libraries', `${lib.slug}.php`)

      compileFile({
        srcPath: path.join(global.templates.path, '_partials', 'class.php'),
        dstPath: libPath,
        syntax: {
          theme: theme.details,
          lib
        }
      })

      saveConfig(db, {
        libraries: uniq(theme.libraries)
      }).then(() => {
        done({
          message: message.SUCCEED_LIBCLASS_ADDED,
          padding: true,
          exit: true
        })
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
