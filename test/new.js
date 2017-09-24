import test from 'ava'

const addNewTheme = () => {
  return execa.stdout(deux, ['new', `--db=${dbPath}`, `--input=${JSON.stringify(config)}}`])
}

test('Add new theme should be succeed.', async t => {
  await addNewTheme().then(() => {

  })
})
