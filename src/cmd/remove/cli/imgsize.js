const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveImageSize extends CLI {
  constructor() {
    super()
    this.themeImageSize = undefined
    this.init()
  }

  /**
   * Setup remove image size prompts
   */
  prepare() {
    this.themeImageSize = this.themeInfo('imgsize')

    if (Object.keys(this.themeImageSize).length === 0) {
      happyExit()
    }

    this.title = 'Remove {Image Sizes}'
    this.prompts = [
      {
        type: 'checkbox',
        name: 'imgsize',
        message: 'Select Image Size you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in this.themeImageSize) {
            if (Object.prototype.hasOwnProperty.call(this.themeImageSize, value)) {
              list.push({
                name: `${this.themeImageSize[value].name} (${this.themeImageSize[value].width}x${this.themeImageSize[value].height} pixels)`,
                value
              })
            }
          }

          if (list.length > 0) {
            list = separatorMaker('Image Size List').concat(list)
          }

          resolve(list)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({imgsize}) => imgsize.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({imgsize, captcha}) => imgsize.length > 0 && captcha,
        default: false,
        message: () => 'Removing image size from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove image size from config
   *
   * @param {Object} {imgsize, confirm}
   */
  action({imgsize, confirm}) {
    if (imgsize.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(imgsize.map(
      item => new Promise(resolve => {
        delete this.themeImageSize[item]
        resolve()
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            imgsize: this.themeImageSize
          })
          resolve()
        })
      ]).then(
        finish(messages.SUCCEED_REMOVED_IMGSIZE)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveImageSize
