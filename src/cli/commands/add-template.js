import path from 'path'
import inquirer from 'inquirer'
import jsonr from 'json-realtime'
import faker from 'faker'
import _s from 'string'
import * as message from '../../lib/messages'
import {error, colorlog} from '../../lib/logger'
import {projectPath, wpThemeDir, templateDir, deuxConfig} from '../../lib/const'
import {compileFile} from '../../lib/utils'

export default () => {
  colorlog('Add {template}')
  const prompts = [
    {
      type: 'list',
      name: 'templateType',
      message: 'Select template type',
      choices: [
        {
          value: 'page',
          name: 'Page Template'
        },
        {
          value: 'partial',
          name: 'Partial Template'
        }
      ]
    },

    {
      type: 'input',
      name: 'templateName',
      message: 'Template Name',
      when: ({templateType}) => templateType === 'page'
    },

    {
      type: 'list',
      name: 'postType',
      message: 'Post Type',
      when: ({templateType}) => templateType === 'page',
      choices: [
        {
          value: 'post',
          name: 'Post'
        },
        {
          value: 'page',
          name: 'Page'
        },
        new inquirer.Separator(),
        {
          value: null,
          name: 'Other (specify)'
        }
      ]
    },

    {
      type: 'input',
      name: 'customPostType',
      message: 'Custom Post Type',
      when: answers => answers.templateType === 'page' && !answers.postType,
      filter: value => value.toLowerCase()
    },

    {
      type: 'input',
      name: 'partialPrefix',
      message: 'Template Prefix',
      when: ({templateType}) => templateType === 'partial',
      validate: value => {
        if (value.length < 1) {
          return 'Invalid prefix, at least should have 3 letters.'
        }
        return true
      }
    },

    {
      type: 'input',
      name: 'partialName',
      message: 'Template Name [optional]',
      when: ({templateType}) => templateType === 'partial'
    },

    {
      type: 'input',
      name: 'description',
      message: 'Description',
      default: faker.lorem.sentence(),
      when: ({templateType}) => templateType === 'partial',
      validate: value => {
        if (value.split(' ').length <= 2) {
          return 'Description at least should have 3 words.'
        }

        return true
      }
    }
  ]
  inquirer.prompt(prompts).then(answers => {
    const deuxProject = jsonr(projectPath)
    if (deuxProject.current === '') {
      error({
        message: message.ERROR_INVALID_PROJECT,
        error: true,
        padding: true
      })
    }

    const {
      templateType,
      templateName,
      postType,
      customPostType,
      partialPrefix,
      partialName,
      description
    } = answers

    const {themeName, version} = deuxProject.list[deuxProject.current]
    const themePath = path.join(wpThemeDir, deuxProject.current)
    const themeConfig = jsonr(path.join(themePath, deuxConfig))
    const pageTemplates = themeConfig.templates.page
    const partialTemplates = themeConfig.templates.partial

    const defaultSyntax = {themeName, version}
    let templateSlug
    let realPostType
    let syntax

    switch (templateType) {
      case 'partial':
        templateSlug = _s(partialPrefix).slugify().s
        if (partialName.length > 0) {
          templateSlug += '-' + _s(partialName).slugify().s
        }

        if (partialTemplates.includes(templateSlug)) {
          error({
            message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
            exit: true,
            padding: true
          })
        }
        syntax = Object.assign({description}, defaultSyntax)
        compileFile({
          srcPath: path.join(templateDir, '_partials', 'partial-template.php'),
          dstPath: path.join(themePath, 'partial-templates', `${templateSlug}.php`),
          syntax
        })
        partialTemplates.push(templateSlug)
        themeConfig.templates.partial = partialTemplates
        break

      case 'page':
        templateSlug = _s(templateName).slugify().s
        if (pageTemplates.includes(templateSlug)) {
          error({
            message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
            exit: true,
            padding: true
          })
        }

        realPostType = postType === null ? customPostType : postType
        syntax = Object.assign({templateName, postType: realPostType}, defaultSyntax)
        compileFile({
          srcPath: path.join(templateDir, '_partials', 'page-template.php'),
          dstPath: path.join(themePath, 'page-templates', `${templateSlug}.php`),
          syntax
        })
        pageTemplates.push(templateSlug)
        themeConfig.templates.page = pageTemplates
        break

      default:
        // Noop
        break
    }
  })
}
