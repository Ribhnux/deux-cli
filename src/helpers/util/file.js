const path = require('path')
const {readdirSync, statSync} = require('fs')

const scandir = dir => readdirSync(dir)

const dirlist = dir => {
  return scandir(dir).filter(
    item => statSync(path.join(dir, item)).isDirectory()
  )
}

const filelist = dir => {
  return scandir(dir).filter(
    item => statSync(path.join(dir, item)).isFile()
  )
}

module.exports = {
  scandir,
  dirlist,
  filelist
}
