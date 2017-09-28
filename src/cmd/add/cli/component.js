const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddComponent extends CLI {
  constructor(options) {
    super()
    this.init(false, options)
  }

  /**
   * Setup add component prompts
   */
  prepare() {
    this.$title = 'Add {New Component}'
    this.$prompts = [
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
        name: 'overwrite',
        message: 'Component already exists. Continue to overwrite?',
        default: true,
        when: ({component}) => new Promise(resolve => {
          const components = this.themeInfo('components').includes(slugify(component.name))
          resolve(components)
        })
      }
    ]
  }

  /**
   * Compile components file and config
   *
   * @param {Object} {component, overwrite}
   */
  action({component, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_COMPONENT_ALREADY_EXISTS)
    }

    Promise.all([
      new Promise(resolve => {
        component.slug = slugify(component.name)
        component.slugfn = slugify(component.name, {replacement: '_'})

        compileFile({
          srcPath: this.templateSourcePath('_partials', 'component.php'),
          dstPath: this.currentThemePath('components', `${component.slug}.php`),
          syntax: {
            theme: this.themeDetails(),
            component
          }
        })

        resolve()
      }),

      new Promise(resolve => {
        const components = this.themeInfo().components
          .filter(item => item !== component.slug)
          .concat(component.slug)

        this.setThemeConfig({
          components: uniq(components)
        })

        resolve()
      })
    ]).then(
      this.$logger.finish(messages.SUCCEED_COMPONENT_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddComponent
