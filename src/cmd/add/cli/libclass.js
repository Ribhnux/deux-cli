const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')
const {capitalize} = global.deuxhelpers.require('util/misc')

class AddLibClass extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup add libclass prompts
   */
  prepare() {
    this.$title = 'Add {PHP Library}'
    this.$prompts = [
      {
        name: 'lib.name',
        message: 'Library name',
        default: 'New Library',
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        name: 'lib.description',
        message: 'Library description',
        default: faker.lorem.sentence(),
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'overwrite',
        message: 'PHP library already exists. Continue to overwrite?',
        default: true,
        when: ({lib}) => new Promise(resolve => {
          resolve(this.themeInfo('libraries').includes(`class-${slugify(lib.name)}`))
        })
      }
    ]
  }

  /**
   * Compile php library file and config
   *
   * @param {Object} {lib, overwrite}
   */
  action({lib, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_LIBCLASS_ALREADY_EXISTS)
    }

    const slug = slugify(lib.name)
    lib.slug = `class-${slug}`
    lib.className = slug.split('-').map(item => capitalize(item)).join('_')

    const libraries = this.themeInfo('libraries').concat(lib.slug)
    const themeDetails = this.themeDetails()

    Promise.all([
      new Promise(resolve => {
        compileFile({
          srcPath: this.templateSourcePath('_partials', 'class.php'),
          dstPath: this.currentThemePath('includes', 'libraries', `${lib.slug}.php`),
          syntax: {
            theme: themeDetails,
            lib
          }
        })
        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          libraries: uniq(libraries)
        })
        resolve()
      })
    ]).then(
      this.$logger.finish(messages.SUCCEED_LIBCLASS_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddLibClass
