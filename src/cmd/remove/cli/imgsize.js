const inquirer = require('inquirer')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const {getCurrentTheme, saveConfig} = global.helpers.require('db/utils')
const {colorlog, exit, finish} = global.helpers.require('logger')
const message = global.const.require('messages')

module.exports = db => {
  colorlog('Remove {Image Size}')

  getCurrentTheme(db).then(theme => {
    const prompts = [
      {
        type: 'checkbox',
        name: 'imgsize',
        message: 'Select Image Size you want to remove',
        choices: () => new Promise(resolve => {
          let list = []

          for (const value in theme.imgsize) {
            if (Object.prototype.hasOwnProperty.call(theme.imgsize, value)) {
              list.push({
                name: `${theme.imgsize[value].name} (${theme.imgsize[value].width}x${theme.imgsize[value].height} pixels)`,
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

    if (Object.keys(theme.imgsize).length === 0) {
      happyExit()
    }

    inquirer.prompt(prompts).then(({imgsize, confirm}) => {
      if (imgsize.length === 0 || !confirm) {
        happyExit()
      }

      Promise.all(imgsize.map(
        item => new Promise(resolve => {
          delete theme.imgsize[item]
          resolve()
        })
      )).then(() => {
        saveConfig(db, {
          imgsize: theme.imgsize
        }).then(finish(message.SUCCEED_REMOVED_IMGSIZE)).catch(exit)
      }).catch(exit)
    }).catch(exit)
  }).catch(exit)
}
