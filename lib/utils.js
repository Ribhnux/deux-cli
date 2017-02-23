const mkdirp = require('mkdirp')
const handlebars = require('handlebars')
const path = require('path')
const fs = require('fs')
const templatePath = path.resolve(__dirname, '..', 'template')

exports.generate = (themedir, data) => {
  // Create theme directory
  mkdirp.sync(themedir)

  // Clean tags with comma separators
  data.tags = data.tags.join(', ')

  return new Promise(resolve => {
    fs.readdirSync(templatePath).forEach(fileName => {
      const filePath = path.join(templatePath, fileName)

      if (fs.statSync(filePath).isFile()) {
        const fileStr = fs.readFileSync(filePath, 'ascii')
        const template = handlebars.compile(fileStr)
        const output = template(data)
        fs.writeFileSync(path.join(themedir, fileName), output, 'utf-8')
      }

      resolve(true)
    })
  })
}

exports.isJson = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}
