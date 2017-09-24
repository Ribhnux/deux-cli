import path from 'path'
import {existsSync} from 'fs'
import test from 'ava'
import execa from 'execa'
import rimraf from 'rimraf'
import jsonr from 'json-realtime'
import jsonar from 'jsonar'
import arrandel from 'arrandel'
import {deux, dbPath, wpPath, dbTypes} from './fixtures'

const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
}

const themePath = path.join(wpPath, 'wp-content', 'themes', 'deux-theme')

const cleanupTheme = () => {
  rimraf.sync(path.join(themePath))
}

const cleanupDb = () => {
  rimraf.sync(dbPath)
}

test.before('Cleanup db before init', async () => {
  await cleanupDb()
})

test.before('Cleanup theme before init', async () => {
  await cleanupTheme()
})

test.after('Cleanup db after init', async () => {
  await cleanupDb()
})

test.after('Cleanup theme after init', async () => {
  await cleanupTheme()
})

/**
 * Init theme.
 */
test('INIT: Error config should be fail.', async t => {
  await execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}}`])
    .catch(() => {
      t.pass()
    })
})

const initTheme = (() => new Promise(resolve => {
  execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}`]).then(() => {
    resolve()
  })
}))()

test('INIT: Correct config should be succeed.', async t => {
  await initTheme.then(() => {
    t.pass()
  })
})

/**
 * Add new theme
 */
const defaultConfig = {
  theme: {
    name: 'Deux Theme',
    uri: 'https://github.com/RibhnuxDesign/ramen-theme',
    author: 'Ribhnux Design',
    authorUri: 'https://github.com/RibhnuxDesign',
    description: 'Example description',
    version: '1.0.0',
    tags: 'full-width-template, blog',
    repoUrl: 'https://github.com/RibhnuxDesign/ramen-theme.git'
  },
  overwrite: true
}

const addNewTheme = ((newConfig = {}) => {
  const config = Object.assign(newConfig, defaultConfig)
  return new Promise(resolve => {
    execa.stdout(deux, ['new', `--db=${dbPath}`, `--input=${JSON.stringify(config)}`]).then(() => {
      resolve()
    })
  })
})()

test('NEW COMMAND: Add new theme should be succeed.', async t => {
  await initTheme.then(async () => {
    await addNewTheme.then(() => {
      t.true(existsSync(themePath))
    })
  })
})

test('NEW COMMAND: Config should be valid.', async t => {
  await initTheme.then(async () => {
    await addNewTheme.then(() => {
      const db = jsonr(dbPath)
      const currentSlug = db[dbTypes.CURRENT].slug
      const currentTheme = db[dbTypes.THEMES][currentSlug]
      const theme = Object.assign({}, currentTheme)

      /* eslint-disable camelcase */
      const config = {
        details: {
          name: 'Deux Theme',
          uri: 'https://github.com/RibhnuxDesign/ramen-theme',
          author: 'Ribhnux Design',
          authorUri: 'https://github.com/RibhnuxDesign',
          description: 'Example description',
          version: '1.0.0',
          tags: 'full-width-template, blog',
          slug: 'deux-theme',
          slugfn: 'deux_theme',
          created: {
            year: new Date().getFullYear()
          }
        },
        develop: false,
        optimize: true,
        asset: {
          libs: {},
          sass: {
            components: [],
            layouts: [],
            pages: [],
            themes: [],
            vendors: []
          },
          fonts: {}
        },
        plugins: {},
        components: [
          'pagination',
          'post-meta',
          'posted-on'
        ],
        imgsize: {},
        filters: [],
        actions: [],
        libraries: [
          'class-tgm-plugin-activation'
        ],
        helpers: [],
        menus: {},
        widgets: {},
        features: {},
        customizer: {
          panels: {},
          sections: {},
          settings: {},
          control_types: {},
          controls: {}
        }
      }
      delete theme.releases

      const emptyRules = {
        asset: {
          libs: {},
          sass: {
            components: [],
            layouts: [],
            pages: [],
            themes: [],
            vendors: []
          },
          fonts: {}
        },
        plugins: {},
        components: [],
        imgsize: {},
        filters: [],
        actions: [],
        libraries: [],
        helpers: [],
        menus: {},
        widgets: {},
        features: {},
        customizer: {
          panels: {},
          sections: {},
          settings: {},
          control_types: {},
          controls: {}
        }
      }
      /* eslint-enable */

      const configFile = path.join(themePath, `${currentSlug}-config.php`)

      t.is(currentSlug, 'deux-theme')
      t.true(existsSync(configFile))
      t.deepEqual(theme, config)

      const phpArray = arrandel(configFile)
      const phpConfig = jsonar.parse(phpArray.deux_theme_config, {
        emptyRules
      })

      delete config.details
      t.deepEqual(config, phpConfig)
    })
  })
})

test('NEW COMMAND: Directory structures should be valid.', async t => {
  await initTheme.then(async () => {
    await addNewTheme.then(() => {
      // Assets.
      t.true(existsSync(path.join(themePath, 'assets')))
      t.true(existsSync(path.join(themePath, 'assets', 'js')))
      t.true(existsSync(path.join(themePath, 'assets', 'css')))
      t.true(existsSync(path.join(themePath, 'assets', 'images')))

      // Assets source.
      t.true(existsSync(path.join(themePath, 'assets-src')))
      t.true(existsSync(path.join(themePath, 'assets-src', 'sass')))
      t.true(existsSync(path.join(themePath, 'assets-src', 'js')))
      t.true(existsSync(path.join(themePath, 'assets-src', 'libs')))

      // Templates
      t.true(existsSync(path.join(themePath, 'components')))
      t.true(existsSync(path.join(themePath, 'page-templates')))
      t.true(existsSync(path.join(themePath, 'partial-templates')))

      // Includes.
      t.true(existsSync(path.join(themePath, 'includes')))
      t.true(existsSync(path.join(themePath, 'includes', 'actions')))
      t.true(existsSync(path.join(themePath, 'includes', 'customizers')))
      t.true(existsSync(path.join(themePath, 'includes', 'filters')))
      t.true(existsSync(path.join(themePath, 'includes', 'helpers')))
      t.true(existsSync(path.join(themePath, 'includes', 'libraries')))
      t.true(existsSync(path.join(themePath, 'includes', 'loaders')))
      t.true(existsSync(path.join(themePath, 'includes', 'plugins')))

      // Languages
      t.true(existsSync(path.join(themePath, 'languages')))
    })
  })
})
