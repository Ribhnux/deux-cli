import path from 'path'
import test from 'ava'
import execa from 'execa'
import {deux, dbPath, wpPath} from './fixtures'

const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
}

test('Error config should be fail.', async t => {
  await execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}}`])
    .catch(() => {
      t.pass()
    })
})

test('Correct config should be succeed.', async t => {
  await execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}`])
    .then(output => {
      t.pass()
    })
})
