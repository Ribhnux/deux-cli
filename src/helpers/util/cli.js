const faker = require('faker')
const inquirer = require('inquirer')

const messages = global.deuxcli.require('messages')
const finish = global.deuxhelpers.require('logger/finish')
const validator = global.deuxhelpers.require('util/validator')

exports.happyExit = () => finish(messages.DONE_NO_REMOVE)

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
