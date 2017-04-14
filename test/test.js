import fs from 'fs'
import path from 'path'
import test from 'ava'

const baseName = 'deux'
const root = path.resolve(__dirname, '..')
const binPath = path.join(root, 'bin')

test('deux should be exists', t => {
  t.truthy(fs.existsSync(path.join(binPath, baseName)))
})
