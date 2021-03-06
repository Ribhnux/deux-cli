const inquirer = require('inquirer')
const slugify = require('node-slugify')
const {positionTypes} = require('./fixtures')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')

class AddImageSize extends CLI {
  constructor(options) {
    super()
    this.init(options)
  }

  /**
   * Setup add image size prompts
   */
  prepare() {
    this.$title = 'Add {Image Size}'
    this.$prompts = [
      {
        name: 'imgsize.name',
        message: 'Image Size Name',
        default: 'New Size',
        validate: value => validator(value, {minimum: 3, var: `"${value}"`})
      },

      {
        name: 'imgsize.width',
        message: 'Image width in px',
        default: 0,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        name: 'imgsize.height',
        message: 'Image height in px',
        default: 0,
        validate: value => validator(value, {number: true, minimum: 1, var: `"${value}"px`}),
        filter: value => Number(value)
      },

      {
        type: 'confirm',
        name: 'imgsize.crop',
        message: 'Is image size has cropping feature?',
        default: true
      },

      {
        type: 'confirm',
        name: 'imgsize.custompos',
        message: 'Set custom crop position?',
        when: ({imgsize}) => imgsize.crop,
        default: false
      },

      {
        type: 'list',
        name: 'imgsize.pos',
        message: 'Image position',
        when: ({imgsize}) => imgsize.crop && imgsize.custompos,
        choices: [
          new inquirer.Separator(),

          {
            name: 'Top Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Top Center',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Top Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.TOP
            }
          },

          {
            name: 'Center Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Center Middle',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Center Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.CENTER
            }
          },

          {
            name: 'Bottom Left',
            value: {
              x: positionTypes.LEFT,
              y: positionTypes.BOTTOM
            }
          },

          {
            name: 'Bottom Center',
            value: {
              x: positionTypes.CENTER,
              y: positionTypes.BOTTOM
            }
          },

          {
            name: 'Bottom Right',
            value: {
              x: positionTypes.RIGHT,
              y: positionTypes.BOTTOM
            }
          }
        ]
      },

      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Image Size already exists. Continue to overwrite?',
        default: true,
        when: ({imgsize}) => new Promise(resolve => {
          resolve(this.themeInfo('imgsize')[slugify(imgsize.name)] !== undefined)
        })
      }
    ]
  }

  /**
   * Compile image size file and config
   *
   * @param {Object} {imgsize, overwrite}
   */
  action({imgsize, overwrite}) {
    if (overwrite === false) {
      this.$logger.exit(messages.ERROR_IMGSIZE_ALREADY_EXISTS)
    }

    const slug = slugify(imgsize.name)
    const crop = imgsize.crop && imgsize.custompos ? imgsize.pos : imgsize.crop
    const imageSize = this.themeInfo('imgsize')

    Promise.all([
      new Promise(resolve => {
        imageSize[slug] = {
          name: imgsize.name,
          width: imgsize.width,
          height: imgsize.height,
          crop
        }
        resolve()
      })
    ]).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            imgsize: imageSize
          })
          resolve()
        })
      ]).then(
        this.$logger.finish(messages.SUCCEED_IMGSIZE_ADDED)
      ).catch(this.$logger.exit)
    }).catch(this.$logger.exit)
  }
}

module.exports = AddImageSize
