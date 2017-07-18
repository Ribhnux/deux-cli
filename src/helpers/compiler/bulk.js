const path = require('path')
const {statSync, existsSync} = require('fs')
const mkdirp = require('mkdirp')
const {scandir} = require('../util/file')
const fileCompiler = require('./single')

const exceptions = [
  '_partials'
]

const bulkCompiler = ({srcDir, dstDir, rename = {}, syntax = {}}) => {
  const files = scandir(srcDir).filter(
    item => !exceptions.includes(item)
  )

  files.forEach(filename => {
    const srcPath = path.join(srcDir, filename)
    const dstPath = path.join(dstDir, (filename in rename) ? rename[filename] : filename)

    if (existsSync(srcPath) && statSync(srcPath).isFile()) {
      fileCompiler({srcPath, dstPath, syntax})
    }

    if (existsSync(srcPath) && statSync(srcPath).isDirectory()) {
      mkdirp.sync(dstPath)
      bulkCompiler({
        srcDir: srcPath,
        dstDir: dstPath,
        syntax
      })
    }
  })
}

module.exports = bulkCompiler
