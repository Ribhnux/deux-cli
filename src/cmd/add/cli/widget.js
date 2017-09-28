const faker = require('faker')
const slugify = require('node-slugify')
const jsonar = require('jsonar')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')

class AddWidget extends CLI {
  constructor(options) {
    super()
    this.init(false, options)
  }

  /**
   * Setup add widget prompts
   */
  prepare() {
    this.$title = 'Register {New Widget}'
    this.$prompts = [
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
        name: 'overwrite',
        message: 'Widget already exists. Continue to overwrite?',
        default: true,
        when: ({widget}) => new Promise(resolve => {
          resolve(this.themeInfo('widgets')[slugify(widget.name)] !== undefined)
        })
      }
    ]
  }

  /**
   * Compile widget config
   * @param {Object} {widget, overwrite}
   */
  action({widget, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_WIDGET_ALREADY_EXISTS)
    }

    const widgets = this.themeInfo('widgets')
    const themeSlug = this.themeDetails('slug')

    Promise.all([
      new Promise(resolve => {
        /* eslint-disable camelcase, quotes */
        widgets[slugify(widget.name)] = {
          name: jsonar.literal(`__( '${widget.name}', '${themeSlug}' )`),
          description: jsonar.literal(`__( '${widget.description}', '${themeSlug}' )`),
          class: '',
          before_widget: jsonar.literal(`'<section id="%1$s" class="widget %2$s">'`),
          after_widget: jsonar.literal(`'</section>'`),
          before_title: jsonar.literal(`'<h2 class="widget-title">'`),
          after_title: jsonar.literal(`'</h2>'`)
        }
        /* eslint-enable */

        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          widgets
        })
        resolve()
      })
    ]).then(
      this.$logger.finish(messages.SUCCEED_WIDGET_ADDED)
    ).catch(this.$logger.exit)
  }
}

module.exports = AddWidget
