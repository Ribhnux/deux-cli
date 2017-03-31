import test from 'ava'
import path from 'path'
import fs from 'fs'

const BASENAME = 'deux'
const filePrefix = `bin/${BASENAME}`
const root = path.resolve(__dirname, '..')
const binPath = path.join(root, 'bin')
const checkExists = filename => {
  let basename = BASENAME
  let filepath = filePrefix
  if (filename) {
    basename += `-${filename}`
    filepath += `-${filename}`
  }

  test(`${filepath} should be exists`, t => {
    t.truthy(fs.existsSync(path.join(binPath, basename)))
  })
}

checkExists()
checkExists('init')