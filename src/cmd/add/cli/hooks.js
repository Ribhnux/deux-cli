const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')
const {hookTypes} = require('./const')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {capitalize} = global.deuxhelpers.require('util/misc')
const {exit, finish} = global.deuxhelpers.require('logger')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddHooks extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup add hook prompts
   */
  prepare() {
    this.title = 'Add {Action / Filter} Hooks'
    this.prompts = [
      {
        type: 'list',
        name: 'hooks.type',
        message: 'Which hooks you want to add?',
        choices: [
          {
            name: 'Filter',
            value: hookTypes.FILTER
          },

          {
            name: 'Action',
            value: hookTypes.ACTION
          }
        ]
      },

      {
        name: 'hooks.name',
        message: ({hooks}) => `${capitalize(hooks.type)} name`,
        default: 'New WordPress Hook',
        validate: value => validator(value, {minimum: 3, var: 'Name'})
      },

      {
        name: 'hooks.description',
        message: ({hooks}) => `${capitalize(hooks.type)} description`,
        default: faker.lorem.sentence(),
        validate: value => validator(value, {minimum: 3, word: true, var: 'Description'})
      },

      {
        name: 'hooks.tag',
        message: ({hooks}) => `${capitalize(hooks.type)} function`,
        default: ({hooks}) => {
          return hooks.type === hookTypes.ACTION ? 'wp_head' : 'the_content'
        },
        validate: value => validator(value, {slug: true, slugPattern: '[a-z0-9-\/_]+', var: 'Function Name'})
      },

      {
        name: 'hooks.priority',
        message: ({hooks}) => `${capitalize(hooks.type)} priority`,
        validate: value => validator(value, {number: true, minimum: 0, var: 'Priority'}),
        default: 10
      },

      {
        type: 'confirm',
        name: 'hooks.overwrite',
        message: ({hooks}) => `${capitalize(hooks.type)} already exists. Continue to overwrite?`,
        default: true,
        when: ({hooks}) => new Promise(resolve => {
          const hookExists = this.themeInfo(`${hooks.type}s`).includes(slugify(hooks.name))
          resolve(hookExists)
        })
      }
    ]
  }

  /**
   * Compile hooks file and config
   *
   * @param {Object} {hooks, confirm}
   */
  action({hooks}) {
    if (hooks.overwrite === false) {
      exit(messages.ERROR_HOOKS_ALREADY_EXISTS)
    }

    hooks.slug = slugify(hooks.name)
    hooks.slugfn = slugify(hooks.name, {replacement: '_'})
    hooks.typeUpper = capitalize(hooks.type)

    Promise.all([
      new Promise(resolve => {
        compileFile({
          srcPath: this.templateSourcePath(['_partials', 'hook.php']),
          dstPath: this.themePath([this.themeDetails('slug'), 'includes', `${hooks.type}s`, `${hooks.slug}.php`]),
          syntax: {
            theme: this.themeDetails(),
            hooks
          }
        })
        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          [`${hooks.type}s`]: uniq(this.themeInfo(`${hooks.type}s`).concat(hooks.slug))
        })
        resolve()
      })
    ]).then(
      finish(messages.SUCCEED_HOOKS_ADDED)
    ).catch(exit)
  }
}

module.exports = AddHooks
