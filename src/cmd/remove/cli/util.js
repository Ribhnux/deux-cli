const faker = require('faker')
const inquirer = require('inquirer')

const done = global.helpers.require('logger/done')
const message = global.const.require('messages')
const validator = global.helpers.require('util/validator')

exports.happyExit = () => {
  done({
    message: message.DONE_NO_REMOVE,
    padding: true,
    exit: true
  })
}

exports.captchaMaker = () => {
  const randomCaptcha = faker.lorem.word()

  return {
    name: 'captcha',
    message: `Type "${randomCaptcha}" to continue`,
    validate: value => validator(value, {equal: randomCaptcha, var: `"${value}"`})
  }
}

exports.separatorMaker = label => [
  new inquirer.Separator(' '),
  new inquirer.Separator(label),
  new inquirer.Separator('')
]
