const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddHelper extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup add helpers prompts
   */
  prepare() {
    this.$title = 'Add {Helper} (PHP Function)'
    this.$prompts = [
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
        name: 'overwrite',
        message: 'Helper already exists. Continue to overwrite?',
        default: true,
        when: ({helper}) => new Promise(resolve => {
          const helpers = this.themeInfo('helpers').includes(slugify(helper.name))
          resolve(helpers)
        })
      }
    ]
  }

  /**
   * Compile helpers file and config
   *
   * @param {Object} {helper, overwrite}
   */
  action({helper, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_HELPER_ALREADY_EXISTS)
    }

    helper.slugfn = slugify(helper.name, {replacement: '_'})
    helper.slug = slugify(helper.name)

    Promise.all([
      new Promise(resolve => {
        compileFile({
          srcPath: this.templateSourcePath('_partials', 'helper.php'),
          dstPath: this.currentThemePath('includes', 'helpers', `${helper.slug}.php`),
          syntax: {
            theme: this.themeDetails(),
            helper
          }
        })
        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          helpers: uniq(this.themeInfo('helpers').concat(helper.slug))
        })
        resolve()
      })
    ]).then(
      this.$logger.finish(messages.SUCCEED_HELPER_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddHelper
