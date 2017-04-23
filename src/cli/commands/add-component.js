import path from 'path'
import {existsSync} from 'fs'
import inquirer from 'inquirer'
import faker from 'faker'
import _s from 'string'
import jsonr from 'json-realtime'
import {error, colorlog} from '../../lib/logger'
import {compileFile} from '../../lib/utils'
import {projectPath, templateDir, wpThemeDir, deuxConfig} from '../../lib/const'
import * as message from '../../lib/messages'

export default () => {
  colorlog('Add {component} template')
  const prompts = [
    {
      type: 'input',
      name: 'componentName',
      message: 'Name',
      default: 'New Component',
      validate: value => {
        if (value.length <= 2) {
          return 'Name should have at least 3 letters.'
        }

        return true
      }
    },

    {
      type: 'input',
      name: 'componentDesc',
      message: 'Description',
      default: faker.lorem.sentence(),
      validate: value => {
        if (value.split(' ').length <= 2) {
          return 'Description should have at least 3 words.'
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

    const {componentName, componentDesc} = answers
    const componentSlug = _s(componentName).slugify().s
    const themePath = path.join(wpThemeDir, deuxProject.current)
    const componentPath = path.join(themePath, 'components', `${componentSlug}.php`)
    if (existsSync(componentPath)) {
      error({
        message: message.ERROR_COMPONENT_ALREADY_EXISTS,
        error: true,
        padding: true
      })
    }

    const {themeName, version} = deuxProject.list[deuxProject.current]
    const themeFnPrefix = _s(themeName).underscore().s
    const componentFn = _s(componentName).underscore().s
    const syntax = {
      version,
      themeName,
      themeFnPrefix,
      componentName,
      componentDesc,
      componentFn
    }

    compileFile({
      srcPath: path.join(templateDir, '_partials', 'component.php'),
      dstPath: componentPath,
      syntax
    })

    const themeConfig = jsonr(path.join(themePath, deuxConfig))
    const {components} = themeConfig
    components.push(componentSlug)
    themeConfig.components = components
  })
}
