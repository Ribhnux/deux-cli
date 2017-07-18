const validate = require('validate.js')
const semver = require('semver')
const weft = require('weft')

// Semver Validator
validate.validators.semver = function (value, options) {
  if (!validate.isDefined(value)) {
    return
  }

  options = validate.extend({}, this.options, options)
  const message = options.message || this.message || 'is not a valid version'

  if (semver.valid(value) === null) {
    return message
  }
}

// Color validator
validate.validators.color = function (value, options) {
  if (!validate.isDefined(value)) {
    return
  }

  options = validate.extend({}, this.options, options)
  const message = options.message || this.message || 'is not a valid color'

  if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value) === false) {
    return message
  }
}

const errorMessage = (variable, msg) => (variable.length > 0) ? `^${variable} ${msg}` : msg
const allowedSlugs = '[a-z0-9-]+'

module.exports = (value, options) => {
  options = Object.assign({
    slug: false,
    slugPattern: allowedSlugs,
    minimum: 0,
    word: false,
    array: false,
    url: false,
    ext: '',
    git: false,
    semver: false,
    fontApiKey: false,
    color: false,
    var: '',
    number: false,
    equal: false
  }, options)

  const rules = {value: {}}

  if (options.fontApiKey) {
    weft.apiKey(value)
    return new Promise((resolve, reject) => {
      weft.list().then(() => {
        resolve(true)
      }).catch(() => {
        reject(new Error('Invalid API Key. Get API Key from https://console.developers.google.com/'))
      })
    })
  }

  if (options.minimum > 0 && options.number === false) {
    const lengthRule = {}
    let tokenSuffix = 'characters'
    let tooShort = 'is too short'
    let minimumIs = 'minimum is'

    if (options.word) {
      lengthRule.tokenizer = value => value.split(/\s+/g)
      tokenSuffix = 'words'
    }

    if (options.array) {
      lengthRule.tokenizer = value => value
      tooShort = 'are less selected'
      tokenSuffix = 'is selected'
      minimumIs = 'at least'
    }

    lengthRule.minimum = options.minimum
    lengthRule.tooShort = errorMessage(options.var, `${tooShort} (${minimumIs} ${options.minimum} ${tokenSuffix})`)
    rules.value.length = lengthRule
  }

  if (options.url) {
    const scheme = ['http', 'https', 'git', 'ssh']
    let urlStr = 'url'

    if (options.git) {
      urlStr = 'git'
    }

    rules.value.url = {
      scheme,
      message: errorMessage(options.var, `is not a valid ${urlStr}`)
    }

    if (options.ext.length > 0) {
      const averb = 'aeiou'.split('').includes(options.ext.charAt(0).toLowerCase()) ? 'an' : 'a'
      rules.value.format = {
        pattern: '(.*).zip$',
        message: errorMessage(options.var, `is not ${averb} ${options.ext} file`)
      }
    }
  }

  if (options.slug) {
    let slugMessage = 'is slug, only contains lowercase alphabet, number, and -'
    if (options.slugPattern !== allowedSlugs) {
      slugMessage = `is slug, only contains ${options.slugPattern}`
    }

    rules.value.format = {
      pattern: options.slugPattern,
      message: errorMessage(options.var, slugMessage)
    }
  }

  if (options.semver) {
    rules.value.semver = {
      message: errorMessage(options.var, 'is not a valid version')
    }
  }

  if (options.color) {
    rules.value.color = {
      message: errorMessage(options.var, 'is not valid color')
    }
  }

  if (options.number) {
    let numberMessage = 'is not valid number'
    if (options.minimum > 0) {
      numberMessage += `, should be greater than ${options.minimum}`
    }

    rules.value.numericality = {
      strict: true,
      greaterThan: options.minimum,
      message: errorMessage(options.var, numberMessage)
    }
  }

  if (options.equal) {
    const equalMessage = `is not the same with "${options.equal}"`
    rules.value.equality = {
      attribute: 'equal',
      comparator: val => val === options.equal,
      message: errorMessage(options.var, equalMessage)
    }
  }

  const validator = validate({value}, rules)
  if (validator && validator.value && validator.value.length > 0) {
    return validator.value[0]
  }

  return true
}
