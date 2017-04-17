import path from 'path'
import {existsSync, writeFile} from 'fs'
import inquirer from 'inquirer'
import faker from 'faker'
import _s from 'string'
import Listr from 'listr'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import execa from 'execa'
import wpFileHeader from 'wp-get-file-header'
import jsonr from 'json-realtime'
import * as message from '../../lib/messages'
import {deuxConfig, projectPath, validTags, wpThemeDir, templateDir} from '../../lib/const'
import {error, colorlog} from '../../lib/logger'
import {dirlist, compileFiles} from '../../lib/utils'

export default () => {
  colorlog(`Add new {theme}`)

  const prompts = [
    {
      type: 'confirm',
      name: 'isChild',
      message: 'Is Child Theme?',
      default: false
    },

    {
      type: 'input',
      name: 'themeName',
      message: 'Theme Name',
      default: 'Deux Theme'
    },

    {
      type: 'list',
      name: 'parentTheme',
      message: 'Parent Theme',
      choices: answers => {
        const themes = dirlist(wpThemeDir).map(themeDir => {
          const themeStyle = path.join(wpThemeDir, themeDir, 'style.css')

          return new Promise(resolve => {
            // Check if theme has style.css, since WP themes should have this file
            if (existsSync(themeStyle) === true) {
              wpFileHeader(themeStyle).then(info => {
                const {themeName, textDomain, template} = info
                let resolveValue

                // Pick themes that not a child theme
                if (themeName && textDomain && !template) {
                  resolveValue = {
                    name: themeName,
                    value: textDomain
                  }
                }

                resolve(resolveValue)
              })
            } else {
              resolve()
            }
          }).then(info => info)
        })

        return new Promise(resolve => {
          Promise.all(themes).then(themeResult => {
            const validThemes = themeResult.filter(theme => {
              return theme && theme.name !== answers.themeName
            })
            resolve(validThemes)
          })
        })
      },
      when: ({isChild}) => isChild
    },

    {
      type: 'input',
      name: 'themeUri',
      message: 'Theme URI',
      default: 'http://wordpress.org'
    },

    {
      type: 'input',
      name: 'author',
      message: 'Author',
      default: faker.name.findName()
    },

    {
      type: 'input',
      name: 'authorUri',
      message: 'Author URI',
      default: 'http://wordpress.org'
    },

    {
      type: 'input',
      name: 'description',
      message: 'Description',
      default: faker.lorem.sentence()
    },

    {
      type: 'input',
      name: 'version',
      message: 'Version',
      default: '1.0.0'
    },

    {
      type: 'checkbox',
      message: 'Tags',
      name: 'tags',
      choices: [
        new inquirer.Separator('Tag List'),
        ...validTags.map(value => {
          return {
            value,
            name: _s(value).humanize().s
          }
        })
      ],
      validate: value => {
        if (value.length < 1) {
          return 'Please select at least one tag.'
        }

        return true
      }
    },

    {
      type: 'input',
      name: 'gitUri',
      message: 'Git Repository',
      default: 'https://github.com/example/my-theme.git',
      validate: value => {
        if (value.length < 1 || /https?:\/\//.test(value) === false) {
          return 'Git repository is important for modern developer.'
        }

        return true
      }
    },

    {
      type: 'confirm',
      name: 'overwrite',
      message: 'Theme already exists. Overwrite?',
      default: false,
      when: answers => {
        const themePath = path.join(wpThemeDir, _s(answers.themeName).slugify().s)
        return existsSync(themePath)
      }
    },

    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?'
    }
  ]

  return inquirer
    .prompt(prompts)
    .then(answers => {
      if (!answers.confirm) {
        error({
          message: message.ERROR_THEME_CREATION_CANCELED,
          paddingTop: true,
          exit: true
        })
      }

      const {
        themeName,
        themeUri,
        author,
        authorUri,
        isChild,
        parentTheme,
        description,
        version,
        tags,
        gitUri,
        overwrite
      } = answers

      const themeNameLower = themeName.toLowerCase()
      const textDomain = _s(themeNameLower).slugify().s
      const themePath = path.join(wpThemeDir, textDomain)
      const gitPath = path.join(themePath, '.git')
      const deuxConfigPath = path.join(themePath, deuxConfig)

      colorlog(`Initialize {${themeName}}`)
      const task = new Listr([
        {
          title: 'Make theme directory',
          task: () => new Promise(resolve => {
            if (existsSync(themePath) && overwrite === false) {
              error({
                message: message.ERROR_THEME_ALREADY_EXISTS,
                padding: true,
                exit: true
              })
            }

            mkdirp(themePath, err => {
              if (err) {
                error({
                  message: err.message,
                  padding: true,
                  exit: true
                })
              }

              resolve()
            })
          })
        },

        {
          title: 'Overwrite theme directory',
          enabled: () => overwrite,
          task: () => new Promise(resolve => {
            rimraf(path.join(themePath, '*'), err => {
              if (err) {
                error({
                  message: err.message,
                  padding: true,
                  exit: true
                })
              }

              rimraf(path.join(themePath, '.git'), err => {
                if (err) {
                  error({
                    message: err.message,
                    padding: true,
                    exit: true
                  })
                }
                resolve()
              })
            })
          })
        },

        {
          title: 'Init WordPress Theme',
          task: () => new Listr([
            {
              title: 'Setup theme structures',
              task: () => {
                return new Promise(resolve => {
                  compileFiles({
                    srcDir: templateDir,
                    dstDir: themePath,
                    syntax: {
                      themeName,
                      themeUri,
                      author,
                      authorUri,
                      isChild,
                      parentTheme,
                      description,
                      version,
                      textDomain,
                      tags: tags.join(', ')
                    }
                  })
                  resolve()
                })
              }
            },

            {
              title: 'Copy main templates',
              task: () => {
                console.log(textDomain)
                return true
              }
            }
          ])
        },

        {
          title: 'Init Git',
          task: () => new Listr([
            {
              title: 'Init repository',
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, `--work-tree=${gitPath}`, 'init', '-q'])
            },

            {
              title: `Add remote url \`${gitUri}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'remote', 'add', 'origin', gitUri])
            },

            {
              title: `Validate remote url \`${gitUri}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'pull', 'origin', 'master'])
            },

            {
              title: `Download git objects and refs from \`${gitUri}\``,
              task: () => execa.stdout('git', [`--git-dir=${gitPath}`, 'fetch'])
            }
          ])
        },

        {
          title: `Init config [${deuxConfig}]`,
          task: () => new Listr([
            {
              title: `Create ${deuxConfig} file`,
              task: () => new Promise((resolve, reject) => {
                writeFile(deuxConfigPath, '{}', err => {
                  if (err) {
                    reject(err)
                  }
                  resolve()
                })
              })
            },

            {
              title: 'Save default config',
              task: () => new Promise(resolve => {
                const phpRegx = /\.php$/g
                const notHiddenFile = item => item && item !== '.gitkeep'

                const components = filelist(path.join(templateDir, 'components'))
                  .map(item => item.replace(phpRegx, ''))
                  .filter(notHiddenFile)

                const loopTemplates = filelist(path.join(templateDir, 'loop-templates'))
                  .map(item => item.replace(phpRegx, ''))
                  .filter(notHiddenFile)

                const pageTemplates = filelist(path.join(templateDir, 'page-templates'))
                  .map(item => item.replace(phpRegx, ''))
                  .filter(notHiddenFile)

                const deuxTheme = jsonr(deuxConfigPath)
                deuxTheme.plugins = {}
                deuxTheme.assets = {
                  css: {},
                  js: {},
                  fonts: {}
                }
                deuxTheme.watch = [
                  '*.php',
                  'assets/js/*',
                  'assets/scss/*',
                  'components/*',
                  'loop-templates/*',
                  'page-templates/*',
                  'plugins/*'
                ]
                resolve()
              })
            }
          ])
        },

        {
          title: `Save ${themeName} to project [.deuxproject]`,
          task: () => new Promise(resolve => {
            const deuxProject = jsonr(projectPath)
            deuxProject.current = textDomain
            deuxProject.list[textDomain] = {
              themeName,
              version,
              git: gitUri
            }
            resolve()
          })
        }
      ])

      task.run().catch(() => {
        rimraf(themePath, err => {
          if (err) {
            error({
              message: err.message,
              padding: true,
              exit: true
            })
          }
        })
      })
    })
}
