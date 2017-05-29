import path from 'path'
import inquirer from 'inquirer'
import faker from 'faker'
import _s from 'string'
import * as message from '../lib/messages'
import validator from '../lib/validator'
import {error, done, colorlog} from '../lib/logger'
import {wpThemeDir, templateType, templateDir} from '../lib/const'
import {compileFile} from '../lib/utils'
import {dbErrorHandler, getCurrentTheme, saveConfig} from '../lib/db-utils'

export default db => {
  colorlog('Add a {New Template}')
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
      name: 'templateName',
      message: 'Template Name',
      when: ({templateType}) => templateType === 'page',
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
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
      name: 'customPostType',
      message: 'Custom Post Type',
      default: 'post',
      when: answers => answers.templateType === 'page' && !answers.postType,
      validate: value => validator(value, {minimum: 3, var: `"${value}"`}),
      filter: value => value.toLowerCase()
    },

    {
      name: 'partialPrefix',
      message: 'Template Prefix',
      when: ({templateType}) => templateType === 'partial',
      validate: value => validator(value, {minimum: 3, slug: true, var: `"${value}"`})
    },

    {
      name: 'partialName',
      message: 'Template Name [optional]',
      when: ({templateType}) => templateType === 'partial'
    },

    {
      name: 'description',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
    }
  ]
  inquirer.prompt(prompts).then(answers => {
    getCurrentTheme(db).then(result => {
      const {
        templateName,
        postType,
        customPostType,
        partialPrefix,
        partialName,
        description
      } = answers

      const {
        docId,
        themeName,
        version,
        textDomain,
        template
      } = result

      const defaultSyntax = {
        themeName,
        version,
        description
      }

      const themePath = path.join(wpThemeDir, textDomain)

      let templateSlug

      switch (answers.templateType) {
        case templateType.PARTIAL:
          templateSlug = _s(partialPrefix).slugify().s

          if (partialName.length > 0) {
            templateSlug += `-${_s(partialName).slugify().s}`
          }

          if (template.partials.includes(templateSlug)) {
            error({
              message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
              padding: true,
              exit: true
            })
          }

          db.upsert(docId, doc => {
            doc.template.partials.push(templateSlug)
            compileFile({
              srcPath: path.join(templateDir, '_partials', 'partial-template.php'),
              dstPath: path.join(themePath, 'partial-templates', `${templateSlug}.php`),
              syntax: defaultSyntax
            })
            return doc
          }).then(() => {
            saveConfig(db, docId).then(() => {
              done({
                message: message.SUCCEED_PARTIAL_TEMPLATE_ADDED,
                padding: true,
                exit: true
              })
            })
          }).catch(dbErrorHandler)
          break

        case templateType.PAGE:
          templateSlug = _s(templateName).slugify().s

          if (template.pages.includes(templateSlug)) {
            error({
              message: message.ERROR_TEMPLATE_ALREADY_EXISTS,
              padding: true,
              exit: true
            })
          }

          db.upsert(docId, doc => {
            doc.template.pages.push(templateSlug)
            compileFile({
              srcPath: path.join(templateDir, '_partials', 'page-template.php'),
              dstPath: path.join(themePath, 'page-templates', `${templateSlug}.php`),
              syntax: Object.assign(defaultSyntax, {
                templateName,
                postType: postType === null ? customPostType : postType
              })
            })

            return doc
          }).then(() => {
            saveConfig(db, docId).then(() => {
              done({
                message: message.SUCCEED_PAGE_TEMPLATE_ADDED,
                padding: true,
                exit: true
              })
            })
          }).catch(dbErrorHandler)
          break

        default:
          // Noop
          break
      }
    })
  })
}
