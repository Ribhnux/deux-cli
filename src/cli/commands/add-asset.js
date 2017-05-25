// Font API
// https://developers.google.com/fonts/docs/developer_api

import inquirer from 'inquirer'
import cdnjs from 'cdnjs-api'
import * as message from '../../lib/messages'
import validator from '../../lib/validator'
import {colorlog} from '../../lib/logger'
import {assetType, assetSource, registeredScript} from '../../lib/const'

export default db => {
  colorlog(`Add a {New Asset} dependencies`)

  const prompts = [
    {
      type: 'list',
      name: 'type',
      message: 'What you want to add?',
      choices: [
        {
          name: 'CSS or JS Library',
          value: assetType.LIB
        },

        {
          name: 'Sassy CSS',
          value: assetType.SCSS
        },

        {
          name: 'Web Fonts',
          value: assetType.FONT
        }
      ]
    },

    {
      type: 'list',
      name: 'source',
      message: 'Library Source',
      when: ({type}) => type === assetType.LIB,
      choices: [
        {
          name: 'From CDN',
          value: assetSource.CDN
        },

        {
          name: 'From WordPress',
          value: assetSource.WP
        }
      ]
    },

    {
      name: 'search',
      message: 'Search Libraries',
      when: ({source}) => source === assetSource.CDN,
      validate: value => validator(value, {minimum: 3, var: `"${value}"`})
    },

    {
      type: 'list',
      name: 'libname',
      message: 'Select Library',
      when: ({source}) => source === assetSource.WP,
      choices: () => new Promise(resolve => {
        resolve(registeredScript.map(item => {
          const {name, handle, deps} = item
          const value = {handle}
          if (deps) {
            value.deps = deps
          }

          return {
            name,
            value
          }
        }))
      })
    },

    {
      type: 'list',
      name: 'libname',
      message: 'Select Library',
      when: ({source, search}) => source === assetSource.CDN && search.length > 0,
      choices: ({search}) => new Promise((resolve, reject) => {
        cdnjs.search(search, {fields: {author: true}}).then(result => {
          const choices = result.map(item => {
            let name = item.name
            if (item.author) {
              name += ` by ${(item.author.name || item.author)}`
            }
            return {
              name,
              value: {
                handle: item.name
              }
            }
          })

          if (choices.length === 0) {
            reject(new Error(message.ERROR_QUERY_NOT_FOUND))
          }

          choices.splice(0, 0, new inquirer.Separator())
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      })
    },

    {
      type: 'list',
      name: 'libversion',
      message: 'Select Version',
      when: ({source, libname}) => source === assetSource.CDN && libname.handle,
      choices: ({libname}) => new Promise((resolve, reject) => {
        cdnjs.versions(libname.handle).then(result => {
          const choices = result.map(item => {
            return {
              name: `v${item}`,
              value: item
            }
          })
          choices.splice(0, 0, new inquirer.Separator())
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      })
    },

    {
      type: 'checkbox',
      name: 'libfiles',
      message: 'Select Files',
      when: ({source, libname}) => source === assetSource.CDN && libname.handle,
      choices: ({libname, libversion}) => new Promise((resolve, reject) => {
        cdnjs.files(`${libname.handle}@${libversion}`).then(result => {
          const choices = result.map(item => {
            return {
              name: item,
              value: item
            }
          })
          choices.splice(0, 0, new inquirer.Separator())
          resolve(choices)
        }).catch(err => {
          reject(err)
        })
      }),
      validate: value => validator(value, {minimum: 1, array: true, var: 'Files'})
    },

    {
      name: 'libdeps',
      message: 'Dependencies (optional)',
      when: ({source, libname}) => source === assetSource.CDN && libname.handle
    }
  ]

  return inquirer.prompt(prompts).then(answers => {
    console.log(answers)
  })
}
