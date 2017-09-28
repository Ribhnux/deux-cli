import path from 'path'
import {existsSync} from 'fs'
import test from 'ava'
import execa from 'execa'
import rimraf from 'rimraf'
import jsonr from 'json-realtime'
import jsonar from 'jsonar'
import arrandel from 'arrandel'
import {deux, dbPath, wpPath, dbTypes, themePath} from './fixtures'

const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
}

const getConfig = () => {
  const db = jsonr(dbPath)
  const slug = db[dbTypes.CURRENT].slug
  const currentTheme = Object.assign({}, db[dbTypes.THEMES][slug])
  const configPath = path.join(themePath, `${slug}-config.php`)
  const themeConfig = Object.assign({}, currentTheme)
  /* eslint-disable camelcase */
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
  /* eslint-enable camelcase */

  const phpArray = arrandel(configPath)
  const phpConfig = jsonar.parse(phpArray.deux_theme_config, {
    emptyRules
  })

  return {
    db,
    slug,
    themeConfig,
    phpConfig,
    path: configPath
  }
}

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

const initTheme = execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}`])
test('INIT: Correct config should be succeed.', async t => {
  await initTheme.then(() => {
    t.pass()
  })
})

/**
 * Add new theme
 */
const themeConfig = {
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

const addNewTheme = (() => {
  return new Promise(async resolve => {
    await initTheme.then(() => {
      execa.stdout(deux, ['new', `--db=${dbPath}`, `--input=${JSON.stringify(themeConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('NEW COMMAND: Add new theme should be succeed.', async t => {
  await addNewTheme.then(() => {
    t.true(existsSync(themePath))
  })
})

test('NEW COMMAND: Config should be valid.', async t => {
  await addNewTheme.then(() => {
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
    /* eslint-enable camelcase */

    const _config = getConfig()
    t.true(existsSync(_config.path))

    delete _config.themeConfig.releases
    t.deepEqual(_config.themeConfig, config)

    delete config.details
    t.deepEqual(config, _config.phpConfig)

    t.is(_config.slug, 'deux-theme')
  })
})

test('NEW COMMAND: Directory structures should be valid.', async t => {
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

/**
 * Add and remove components.
 */
const addComponent = (() => {
  const componentConfig = {
    component: {
      name: 'Example Component',
      description: 'Example Description'
    }
  }

  return new Promise(async resolve => {
    await addNewTheme.then(() => {
      execa.stdout(deux, ['add', 'component', `--db=${dbPath}`, `--input=${JSON.stringify(componentConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('ADD COMMAND (COMPONENT): should be succeed.', async t => {
  await addComponent.then(() => {
    t.pass()
  })
})

test('ADD COMMAND (COMPONENT): component file should be exists.', async t => {
  await addComponent.then(() => {
    t.true(existsSync(path.join(themePath, 'components', 'example-component.php')))
  })
})

const removeComponent = (() => {
  const componentConfig = {
    components: ['example-component']
  }

  return new Promise(async resolve => {
    await addComponent.then(() => {
      execa.stdout(deux, ['remove', 'component', `--db=${dbPath}`, `--input=${JSON.stringify(componentConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('REMOVE COMMAND (COMPONENT): should be succeed.', async t => {
  await removeComponent.then(() => {
    t.pass()
  })
})

test('REMOVE COMMAND (COMPONENT): component file should be deleted.', async t => {
  await removeComponent.then(() => {
    t.false(existsSync(path.join(themePath, 'components', 'example-component.php')))
  })
})

/**
 * Add and remove menus.
 */
const addMenu = (() => {
  const menuConfig = {
    menu: {
      name: 'Primary',
      description: 'Example Description',
      walker: true
    }
  }

  return new Promise(async resolve => {
    await removeComponent.then(() => {
      execa.stdout(deux, ['add', 'menu', `--db=${dbPath}`, `--input=${JSON.stringify(menuConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('ADD COMMAND (MENU): should be succeed.', async t => {
  await addMenu.then(() => {
    t.pass()
  })
})

test('ADD COMMAND (MENU): config should be valid.', async t => {
  await addMenu.then(() => {
    const _config = getConfig()
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'primary': {
        walker: true,
        name: jsonar.literal('__( \'Primary\', \'deux-theme\' )'),
        description: jsonar.literal('__( \'Example Description\', \'deux-theme\' )')
      }
      /* eslint-enable quote-props camelcase */
    }, _config.phpConfig.menus)
  })
})

test('ADD COMMAND (MENU): nav-walker library should be exists.', async t => {
  await addMenu.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'libraries', 'class-primary-menu-nav-walker.php')))
  })
})

const removeMenu = (() => {
  const menuConfig = {
    menus: ['primary']
  }

  return new Promise(async resolve => {
    await addMenu.then(() => {
      execa.stdout(deux, ['remove', 'menu', `--db=${dbPath}`, `--input=${JSON.stringify(menuConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('REMOVE COMMAND (MENU): should be succeed.', async t => {
  await removeMenu.then(() => {
    t.pass()
  })
})

test('REMOVE COMMAND (MENU): config should be valid.', async t => {
  await removeMenu.then(() => {
    const _config = getConfig()
    t.deepEqual({}, _config.phpConfig.menus)
  })
})

test('REMOVE COMMAND (MENU): nav-walker library should be deleted.', async t => {
  await removeMenu.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'libraries', 'class-primary-menu-nav-walker.php')))
  })
})

/**
 * Add and remove widgets.
 */
const addWidget = (() => {
  const widgetConfig = {
    widget: {
      name: 'New Widget',
      description: 'Example Description'
    }
  }

  return new Promise(async resolve => {
    await removeMenu.then(() => {
      execa.stdout(deux, ['add', 'widget', `--db=${dbPath}`, `--input=${JSON.stringify(widgetConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('ADD COMMAND (WIDGET): should be succeed.', async t => {
  await addWidget.then(() => {
    t.pass()
  })
})

test('ADD COMMAND (WIDGET): config should be valid.', async t => {
  await addWidget.then(() => {
    const _config = getConfig()
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'new-widget': {
        name: jsonar.literal('__( \'New Widget\', \'deux-theme\' )'),
        description: jsonar.literal('__( \'Example Description\', \'deux-theme\' )'),
        class: '',
        before_widget: '<section id="%1$s" class="widget %2$s">',
        after_widget: '</section>',
        before_title: '<h2 class="widget-title">',
        after_title: '</h2>'
      }
      /* eslint-enable quote-props camelcase */
    }, _config.phpConfig.widgets)
  })
})

const removeWidget = (() => {
  const widgetConfig = {
    widgets: ['new-widget']
  }

  return new Promise(async resolve => {
    await addWidget.then(() => {
      execa.stdout(deux, ['remove', 'widget', `--db=${dbPath}`, `--input=${JSON.stringify(widgetConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('REMOVE COMMAND (WIDGET): should be succeed.', async t => {
  await removeWidget.then(() => {
    t.pass()
  })
})

test('REMOVE COMMAND (WIDGET): config should be valid.', async t => {
  await removeWidget.then(() => {
    const _config = getConfig()
    t.deepEqual({}, _config.phpConfig.widgets)
  })
})
