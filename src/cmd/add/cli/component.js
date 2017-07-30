const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')

class AddComponent extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup add component prompts
   */
  prepare() {
    this.title = 'Add {New Component}'
    this.prompts = [
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
   * @param {Object} {component}
   */
  action({component}) {
    if (component.overwrite === false) {
      exit(messages.ERROR_COMPONENT_ALREADY_EXISTS)
    }

    Promise.all([
      new Promise(resolve => {
        component.slug = slugify(component.name)
        component.slugfn = slugify(component.name, {replacement: '_'})

        compileFile({
          srcPath: this.templateSourcePath(['_partials', 'component.php']),
          dstPath: this.themePath([this.themeDetails('slug'), 'components', `${component.slug}.php`]),
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
      finish(messages.SUCCEED_COMPONENT_ADDED)
    ).catch(exit)
  }
}

module.exports = AddComponent
