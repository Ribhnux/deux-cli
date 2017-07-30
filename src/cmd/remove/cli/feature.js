const rimraf = require('rimraf')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const {featureTypes, featureLabels} = global.deuxcmd.require('add/cli/const')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveFeature extends CLI {
  constructor() {
    super()
    this.themeFeatures = undefined
    this.themeHelpers = undefined
    this.init()
  }

  /**
   * Setup remove assets prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.themeFeatures = themeInfo.features
    this.themeHelpers = themeInfo.helpers

    if (Object.keys(this.themeFeatures).length === 0) {
      happyExit()
    }

    this.title = 'Remove {Features}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themeFeatures) {
            if (Object.prototype.hasOwnProperty.call(this.themeFeatures, value)) {
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
  }

  /**
   * Remove features file and config
   *
   * @param {Object} {features, confirm}
   */
  action({features, confirm}) {
    if (features.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(features.map(
      type => new Promise((resolve, reject) => {
        const removeFiles = []

        switch (type) {
          case featureTypes.CUSTOM_BACKGROUND:
            if ('wp-head-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-background')
            }
            break

          case featureTypes.CUSTOM_HEADER:
            if ('wp-head-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-header')
            }

            if ('video-active-callback' in this.themeFeatures[type]) {
              removeFiles.push('custom-header-video')
            }
            break

          default: break
        }

        Promise.all(removeFiles.map(
          filename => new Promise(resolve => {
            rimraf.sync(this.themePath([this.themeDetails('slug'), 'includes', 'helpers', `${filename}.php`]))
            resolve(filename)
          })
        )).then(filenames => {
          this.themeHelpers = this.themeHelpers.filter(item => !filenames.includes(item))
          delete this.themeFeatures[type]
          resolve()
        }).catch(reject)
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            features: this.themeFatures,
            helpers: this.themeHelpers
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_FEATURE)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveFeature
