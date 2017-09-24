import path from 'path'
import test from 'ava'
import execa from 'execa'

const root = path.resolve(__dirname, '..')
const deux = path.join(root, 'bin', 'deux')
const dbPath = path.resolve(__dirname, '.deuxproject')
const wpPath = path.resolve(__dirname, 'wordpress')
const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
}

test('Init deux project', async t => {
  await execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}`])
    .then(output => {
      console.log(output)
      t.pass()
    })
})
