const inquirer = require('inquirer')
const slugify = require('node-slugify')
const {positionTypes} = require('./const')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const validator = global.helpers.require('util/validator')
const message = global.const.require('messages')
const {colorlog, done, error, exit} = global.helpers.require('logger')

module.exports = db => {
  colorlog('Add {Image Size}')

  const prompts = [
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
      name: 'imgsize.customcrop',
      message: 'Set custom crop position?',
      when: ({imgsize}) => imgsize.crop,
      default: false
    },

    {
      type: 'list',
      name: 'imgsize.pos',
      message: 'Image position',
      when: ({imgsize}) => imgsize.crop && imgsize.customcrop,
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
      name: 'imgsize.overwrite',
      message: 'Image Size already exists. Continue to overwrite?',
      default: true,
      when: ({imgsize}) => new Promise((resolve, reject) => {
        getCurrentTheme(db).then(theme => {
          resolve(theme.imgsize[slugify(imgsize.name)] !== undefined)
        }).catch(reject)
      })
    }
  ]

  return inquirer.prompt(prompts).then(({imgsize}) => {
    getCurrentTheme(db).then(theme => {
      if (imgsize.overwrite === false) {
        error({
          message: message.ERROR_IMGSIZE_ALREADY_EXISTS,
          padding: true,
          exit: true
        })
      }

      const slug = slugify(imgsize.name)
      const crop = imgsize.crop && imgsize.customcrop ? imgsize.pos : imgsize.crop

      theme.imgsize[slug] = {
        name: imgsize.name,
        width: imgsize.width,
        height: imgsize.height,
        crop
      }

      saveConfig(db, {
        imgsize: theme.imgsize
      }).then(() => {
        done({
          message: message.SUCCEED_IMGSIZE_ADDED,
          padding: true,
          exit: true
        })
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
