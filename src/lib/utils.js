import path from 'path'
import {readdirSync, statSync, existsSync, writeFileSync, readFileSync} from 'fs'
import handlebars from 'handlebars'
import mkdirp from 'mkdirp'

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

export const compileFile = ({srcPath, dstPath, syntax}) => {
  const fileStr = readFileSync(srcPath, 'ascii')
  const compiler = handlebars.compile(fileStr)
  const output = compiler(syntax)
  writeFileSync(dstPath, output, 'utf-8')
}

export const compileFiles = ({srcDir, dstDir, syntax}) => {
  const templateDir = scanDir(srcDir).filter(
    item => item !== '_partials'
  )

  templateDir.forEach(filename => {
    const srcPath = path.join(srcDir, filename)
    const dstPath = path.join(dstDir, filename)

    if (existsSync(srcPath) && statSync(srcPath).isFile()) {
      compileFile({srcPath, dstPath, syntax})
    }

    if (existsSync(srcPath) && statSync(srcPath).isDirectory()) {
      mkdirp.sync(dstPath)
      compileFiles({
        srcDir: srcPath,
        dstDir: dstPath,
        syntax
      })
    }
  })
}

export const capitalize = str => {
  return str
    .split(' ')
    .map(item => {
      return item.charAt(0).toUpperCase() + item.split('').slice(1, item.length).join('')
    })
    .join(' ')
}

export default {}
