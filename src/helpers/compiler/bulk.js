const path = require('path')
const {statSync, existsSync} = require('fs')
const mkdirp = require('mkdirp')
const {scandir} = require('../util/file')
const fileCompiler = require('./single')

const bulkCompiler = ({srcDir, dstDir, includes = [], excludes = [], rename = {}, syntax = {}, tree = 0}) => {
  let _files = scandir(srcDir)
  let _includes = []
  let _excludes = []

  if (tree === 0) {
    excludes.forEach(item => {
      const dirname = path.dirname(item)
      if (dirname !== '.' && _excludes.includes(dirname)) {
        _excludes.push(dirname)
      }
    })

    _excludes = _excludes.concat(excludes).map(item => path.join(srcDir, item))

    includes.forEach(item => {
      const dirname = path.dirname(item)
      if (dirname !== '.' && !_includes.includes(dirname)) {
        _includes.push(dirname)
      }
    })

    _includes = _includes.concat(includes).map(item => path.join(srcDir, item))
  } else {
    _includes = includes
    _excludes = excludes
  }

  if (_excludes.length > 0) {
    _files = _files.filter(item => {
      return !_excludes.includes(path.join(srcDir, item))
    })
  }

  if (_includes.length > 0) {
    _files = _files.filter(item => {
      return _includes.includes(path.join(srcDir, item))
    })
  }

  _files.forEach(filename => {
    const srcPath = path.join(srcDir, filename)
    const dstPath = path.join(dstDir, (filename in rename) ? rename[filename] : filename)

    if (existsSync(srcPath)) {
      if (statSync(srcPath).isFile()) {
        fileCompiler({srcPath, dstPath, syntax})
      }

      if (statSync(srcPath).isDirectory()) {
        mkdirp.sync(dstPath)
        bulkCompiler({
          srcDir: srcPath,
          dstDir: dstPath,
          excludes: _excludes,
          includes: _includes,
          tree: tree + 1,
          rename,
          syntax
        })
      }
    }
  })
}

module.exports = bulkCompiler
