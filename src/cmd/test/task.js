const path = require('path')
const execa = require('execa')

module.exports.eslint = (options = [], cmdopts = {}) => {
  return execa.stdout(path.join(global.bin.path, 'xo'), options, cmdopts)
}

module.exports.stylelint = (options = [], cmdopts = {}) => {
  return execa.stdout(path.join(global.bin.path, 'stylelint'), options, cmdopts)
}

module.exports.wpcs = (options = [], cmdopts = {}) => {
  return execa.stdout(path.join(global.bin.path, 'wpcs'), options, cmdopts)
}

module.exports.themecheck = (options = [], cmdopts = {}) => {
  return execa.stdout(path.join(global.bin.path, 'themecheck'), options, cmdopts)
}

module.exports.w3Validator = (options = [], cmdopts = {}) => {
  return execa.stdout(path.join(global.bin.path, 'html5v'), options, cmdopts)
}
