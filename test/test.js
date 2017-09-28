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
test('`deux` (INIT): Error config should be fail.', async t => {
  await execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}}`])
    .catch(() => {
      t.pass()
    })
})

const initTheme = execa.stdout(deux, [`--db=${dbPath}`, `--input=${JSON.stringify(config)}`])
test('`deux` (INIT): Correct config should be succeed.', async t => {
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

test('`deux new`: Add new theme should be succeed.', async t => {
  await addNewTheme.then(() => {
    t.true(existsSync(themePath))
  })
})

test('`deux new`: Config should be valid.', async t => {
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

test('`deux new`: Directory structures should be valid.', async t => {
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
 * Add and remove page template.
 */
const addPageTemplate = (() => {
  const templateConfig = {
    template: {
      type: 'page',
      posttype: 'page',
      name: 'Full Width',
      description: 'Example Description'
    }
  }

  return new Promise(async resolve => {
    await addNewTheme.then(() => {
      execa.stdout(deux, ['add', 'template', `--db=${dbPath}`, `--input=${JSON.stringify(templateConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux add template` (PAGE): should be succeed.', async t => {
  await addPageTemplate.then(() => {
    t.pass()
  })
})

test('`deux add template` (PAGE): template file should be exists.', async t => {
  await addPageTemplate.then(() => {
    t.true(existsSync(path.join(themePath, 'page-templates', 'full-width.php')))
  })
})

const removePageTemplate = (() => {
  const templateConfig = {
    templates: [
      {
        type: 'page',
        file: 'full-width.php'
      }
    ]
  }

  return new Promise(async resolve => {
    await addPageTemplate.then(() => {
      execa.stdout(deux, ['remove', 'template', `--db=${dbPath}`, `--input=${JSON.stringify(templateConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux remove template` (PAGE): should be succeed.', async t => {
  await removePageTemplate.then(() => {
    t.pass()
  })
})

test('`deux remove template` (PAGE): template file should be deleted.', async t => {
  await removePageTemplate.then(() => {
    t.false(existsSync(path.join(themePath, 'page-templates', 'full-width.php')))
  })
})

const addPartialTemplate = (() => {
  const templateConfig = {
    template: {
      type: 'partial',
      prefix: 'header',
      name: 'Navigation',
      description: 'Example Description'
    }
  }

  return new Promise(async resolve => {
    await removePageTemplate.then(() => {
      execa.stdout(deux, ['add', 'template', `--db=${dbPath}`, `--input=${JSON.stringify(templateConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux add template` (PARTIAL): should be succeed.', async t => {
  await addPartialTemplate.then(() => {
    t.pass()
  })
})

test('`deux add template` (PARTIAL): template file should be exists.', async t => {
  await addPartialTemplate.then(() => {
    t.true(existsSync(path.join(themePath, 'partial-templates', 'header-navigation.php')))
  })
})

const removePartialTemplate = (() => {
  const templateConfig = {
    templates: [
      {
        type: 'partial',
        file: 'header-navigation.php'
      }
    ]
  }

  return new Promise(async resolve => {
    await addPartialTemplate.then(() => {
      execa.stdout(deux, ['remove', 'template', `--db=${dbPath}`, `--input=${JSON.stringify(templateConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux remove template` (PARTIAL): should be succeed.', async t => {
  await removePartialTemplate.then(() => {
    t.pass()
  })
})

test('`deux remove template` (PARTIAL): template file should be deleted.', async t => {
  await removePartialTemplate.then(() => {
    t.false(existsSync(path.join(themePath, 'partial-templates', 'header-navigation.php')))
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
    await removePartialTemplate.then(() => {
      execa.stdout(deux, ['add', 'component', `--db=${dbPath}`, `--input=${JSON.stringify(componentConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux add component`: should be succeed.', async t => {
  await addComponent.then(() => {
    t.pass()
  })
})

test('`deux add component`: config should be valid.', async t => {
  await addComponent.then(() => {
    const _config = getConfig()
    t.true(_config.phpConfig.components.includes('example-component'))
  })
})

test('`deux add component`: component file should be exists.', async t => {
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

test('`deux remove component`: should be succeed.', async t => {
  await removeComponent.then(() => {
    t.pass()
  })
})

test('`deux remove component`: config should be valid.', async t => {
  await removeComponent.then(() => {
    const _config = getConfig()
    t.false(_config.phpConfig.components.includes('example-component'))
  })
})

test('`deux remove component`: component file should be deleted.', async t => {
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

test('`deux add menu`: should be succeed.', async t => {
  await addMenu.then(() => {
    t.pass()
  })
})

test('`deux add menu`: config should be valid.', async t => {
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

test('`deux add menu`: nav-walker library should be exists.', async t => {
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

test('`deux remove menu`: should be succeed.', async t => {
  await removeMenu.then(() => {
    t.pass()
  })
})

test('`deux remove menu`: config should be valid.', async t => {
  await removeMenu.then(() => {
    const _config = getConfig()
    t.deepEqual({}, _config.phpConfig.menus)
  })
})

test('`deux remove menu`: nav-walker library should be deleted.', async t => {
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

test('`deux add widget`: should be succeed.', async t => {
  await addWidget.then(() => {
    t.pass()
  })
})

test('`deux add widget`: config should be valid.', async t => {
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

test('`deux remove widget`: should be succeed.', async t => {
  await removeWidget.then(() => {
    t.pass()
  })
})

test('`deux remove widget`: config should be valid.', async t => {
  await removeWidget.then(() => {
    const _config = getConfig()
    t.deepEqual({}, _config.phpConfig.widgets)
  })
})

/**
 * Add and remove php libraries.
 */
const addLibClass = (() => {
  const classConfig = {
    lib: {
      name: 'Example',
      description: 'Example Description'
    }
  }

  return new Promise(async resolve => {
    await removeWidget.then(() => {
      execa.stdout(deux, ['add', 'libclass', `--db=${dbPath}`, `--input=${JSON.stringify(classConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux add libclass`: should be succeed.', async t => {
  await addLibClass.then(() => {
    t.pass()
  })
})

test('`deux add libclass`: config should be valid.', async t => {
  await addLibClass.then(() => {
    const _config = getConfig()
    t.true(_config.phpConfig.libraries.includes('class-example'))
  })
})

test('`deux add libclass`: file should be exists.', async t => {
  await addLibClass.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'libraries', 'class-example.php')))
  })
})

const removeLibClass = (() => {
  const classConfig = {
    libraries: ['class-example']
  }

  return new Promise(async resolve => {
    await addLibClass.then(() => {
      execa.stdout(deux, ['remove', 'libclass', `--db=${dbPath}`, `--input=${JSON.stringify(classConfig)}`]).then(() => {
        resolve()
      })
    })
  })
})()

test('`deux remove libclass`: should be succeed.', async t => {
  await removeLibClass.then(() => {
    t.pass()
  })
})

test('`deux remove libclass`: config should be valid.', async t => {
  await removeLibClass.then(() => {
    const _config = getConfig()
    t.false(_config.phpConfig.libraries.includes('class-example'))
  })
})

test('`deux remove libclass`: file should be deleted.', async t => {
  await removeLibClass.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'libraries', 'class-example.php')))
  })
})
