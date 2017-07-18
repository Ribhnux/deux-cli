const path = require('path')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {featureTypes, featureLabels} = global.commands.require('add/cli/const')
const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, done} = global.helpers.require('logger')
const message = global.const.require('messages')
const {wpThemeDir} = global.const.require('path')

module.exports = db => {
  colorlog('Remove {Features}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in theme.features) {
            if (Object.prototype.hasOwnProperty.call(theme.features, value)) {
              let name = ''

              switch (value) {
                case featureTypes.HTML5:
                  name = featureLabels.HTML5
                  break

                case featureTypes.FEED_LINKS:
                  name = featureLabels.FEED_LINKS
                  break

                case featureTypes.POST_FORMATS:
                  name = featureLabels.POST_FORMATS
                  break

                case featureTypes.POST_THUMBNAILS:
                  name = featureLabels.POST_THUMBNAILS
                  break

                case featureTypes.CUSTOM_BACKGROUND:
                  name = featureLabels.CUSTOM_BACKGROUND
                  break

                case featureTypes.CUSTOM_HEADER:
                  name = featureLabels.CUSTOM_HEADER
                  break

                case featureTypes.CUSTOM_LOGO:
                  name = featureLabels.CUSTOM_LOGO
                  break

                default: break
              }

              list.push({
                name,
                value
              })
            }
          }

          if (list.length > 0) {
            list = separatorMaker('Feature List').concat(list)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({features}) => features.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({features, captcha}) => features.length > 0 && captcha,
        default: false,
        message: () => 'Removing features from config can\'t be undone. Do you want to continue?'
      }
    ]

    if (Object.keys(theme.features).length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({features, confirm}) => {
      if (features.length === 0 || !confirm) {
        happyExit()
      }

      const helpersPath = path.join(wpThemeDir, theme.details.slug, 'includes', 'helpers')

      Promise.all(features.map(
        type => new Promise(resolve => {
          const removeFiles = []

          switch (type) {
            case featureTypes.CUSTOM_BACKGROUND:
              if ('wp-head-callback' in theme.features[type]) {
                removeFiles.push('custom-background')
              }
              break

            case featureTypes.CUSTOM_HEADER:
              if ('wp-head-callback' in theme.features[type]) {
                removeFiles.push('custom-header')
              }

              if ('video-active-callback' in theme.features[type]) {
                removeFiles.push('custom-header-video')
              }
              break

            default: break
          }

          Promise.all(removeFiles.map(
            filename => new Promise(resolve => {
              rimraf.sync(path.join(helpersPath, `${filename}.php`))
              resolve(filename)
            })
          )).then(filenames => {
            theme.helpers = theme.helpers.filter(item => !filenames.includes(item))
            delete theme.features[type]
            resolve()
          })
        })
      )).then(() => {
        saveConfig(db, {
          features: theme.features,
          helpers: theme.helpers
        }).then(() => {
          done({
            message: message.SUCCEED_REMOVED_FEATURE,
            padding: true,
            exit: true
          })
        })
      })
    })
  })
}
