const faker = require('faker')
const inquirer = require('inquirer')

const validator = global.deuxhelpers.require('util/validator')

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
