const faker = require('faker')
const inquirer = require('inquirer')

const finish = global.helpers.require('logger/done')
const message = global.const.require('messages')
const validator = global.helpers.require('util/validator')

exports.happyExit = () => finish(message.DONE_NO_REMOVE)

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
