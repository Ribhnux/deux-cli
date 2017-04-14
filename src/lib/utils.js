import path from 'path'
import {readdirSync, statSync} from 'fs'

export const isJSON = str => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return false
  }
}

export const scanDir = dir => {
  return readdirSync(dir)
}

export const dirlist = dir => {
  return scanDir(dir)
    .filter(item => {
      return statSync(path.join(dir, item)).isDirectory()
    })
}

export const filelist = dir => {
  return scanDir(dir)
    .filter(item => {
      return statSync(path.join(dir, item)).isFile()
    })
}

export default {}
