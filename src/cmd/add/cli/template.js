const inquirer = require('inquirer')
const faker = require('faker')
const slugify = require('node-slugify')
const uniq = require('lodash.uniq')
const {templateTypes, postTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')
const validator = global.deuxhelpers.require('util/validator')
const compileFile = global.deuxhelpers.require('compiler/single')

const slugifyName = (prefix, name) => {
  let slug = slugify(prefix)

  if (name.length > 0) {
    slug += '-' + slugify(name)
  }

  return slug
}

class AddTemplate extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup add template prompts
   */
  prepare() {
    this.title = 'Add {New Template}'
    this.prompts = [
      {
        type: 'list',
        name: 'template.type',
        message: 'Select template type',
        choices: [
          {
            value: templateTypes.PAGE,
            name: 'Page Template'
          },
          {
            value: templateTypes.PARTIAL,
            name: 'Partial Template'
          }
        ]
      },

      {
        name: 'template.name',
        message: 'Template Name',
        when: ({template}) => template.type === templateTypes.PAGE,
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        type: 'list',
        name: 'template.posttype',
        message: 'Post Type',
        when: ({template}) => template.type === templateTypes.PAGE,
        choices: [
          {
            value: postTypes.POST,
            name: 'Post'
          },
          {
            value: postTypes.PAGE,
            name: 'Page'
          },
          new inquirer.Separator(),
          {
            value: postTypes.CUSTOM,
            name: 'Other (specify)'
          }
        ]
      },

      {
        name: 'template.posttype',
        message: 'Custom Post Type',
        default: postTypes.POST,
        when: ({template}) => {
          return template.type === templateTypes.PAGE && template.posttype === postTypes.CUSTOM
        },
        validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
        filter: value => value.split(',').map(item => slugify(item.trim().toLowerCase())).join(', ')
      },

      {
        name: 'template.prefix',
        message: 'Template Prefix',
        when: ({template}) => template.type === templateTypes.PARTIAL,
        validate: value => validator(value, {minimum: 3, slug: true, var: `"${value}"`})
      },

      {
        name: 'template.name',
        message: 'Template Name [optional]',
        when: ({template}) => template.type === templateTypes.PARTIAL
      },

      {
        name: 'template.description',
        message: 'Description',
        default: faker.lorem.sentence(),
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'template.overwrite',
        message: 'Template already exists. Continue to overwrite?',
        default: true,
        when: ({template}) => new Promise(resolve => {
          let slug
          let resolver

          if (template.type === templateTypes.PARTIAL) {
            slug = slugifyName(template.prefix, template.name)
            resolver = this.themeInfo('partialTemplates').includes(slug)
          } else if (template.type === templateTypes.PAGE) {
            slug = slugify(template.name)
            resolver = this.themeInfo('pageTemplates').includes(slug)
          }

          resolve(resolver)
        })
      }
    ]
  }

  /**
   * Compile template file and config
   * @param {Object} {template}
   */
  action({template}) {
    if (template.overwrite === false) {
      exit(messages.ERROR_TEMPLATE_ALREADY_EXISTS)
    }

    const themeDetails = this.themeDetails()
    let srcPath
    let dstPath
    let successMsg
    let partialTemplates
    let pageTemplates

    if (template.type === templateTypes.PARTIAL) {
      template.slug = slugifyName(template.prefix, template.name)
      if (template.name.length === 0) {
        template.name = template.prefix
      }
      srcPath = this.templateSourcePath('_partials', 'partial-template.php')
      dstPath = this.currentThemePath('partial-templates', `${template.slug}.php`)
      successMsg = messages.SUCCEED_PARTIAL_TEMPLATE_ADDED
      partialTemplates = uniq(this.themeInfo('partialTemplates').concat(template.slug))
    }

    if (template.type === templateTypes.PAGE) {
      template.slug = slugify(template.name)
      srcPath = this.templateSourcePath('_partials', 'page-template.php')
      dstPath = this.currentThemePath('page-templates', `${template.slug}.php`)
      successMsg = messages.SUCCEED_PAGE_TEMPLATE_ADDED
      pageTemplates = uniq(this.themeInfo('pageTemplates').concat(template.slug))
    }

    Promise.all([
      new Promise(resolve => {
        compileFile({
          srcPath,
          dstPath,
          syntax: {
            theme: themeDetails,
            template
          }
        })

        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          pageTemplates,
          partialTemplates
        })

        resolve()
      })
    ]).then(
      finish(successMsg)
    ).catch(exit)
  }
}

module.exports = AddTemplate
