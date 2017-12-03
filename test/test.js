import path from 'path'
import {existsSync} from 'fs'
import test from 'ava'
import execa from 'execa'
import jsonar from 'jsonar'
import {deux, dbPath, wpPath, themePath} from './fixtures'
import {getConfig, cleanupTheme, cleanupDb, runCli} from './helpers'

const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
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
  const badConfig = JSON.stringify(config) + '}'
  await runCli([], badConfig).catch(() => t.pass())
})

const initTheme = new Promise(async resolve => {
  await runCli([], config).then(() => {
    resolve()
  })
})

test('`deux` (INIT): Correct config should be succeed.', async t => {
  await initTheme.then(() => {
    t.pass()
  })
})

/**
 * Add new theme
 */
const addNewTheme = new Promise(async resolve => {
  await initTheme.then(() => {
    runCli(['new'], {
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
    }).then(() => {
      resolve()
    })
  })
})

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
const addPageTemplate = new Promise(async resolve => {
  await addNewTheme.then(() => {
    runCli(['add', 'template'], {
      template: {
        type: 'page',
        posttype: 'page',
        name: 'Full Width',
        description: 'Example Description'
      }
    }).then(resolve)
  })
})

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

const removePageTemplate = new Promise(async resolve => {
  await addPageTemplate.then(() => {
    runCli(['remove', 'template'], {
      templates: [
        {
          type: 'page',
          file: 'full-width.php'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

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

const addPartialTemplate = new Promise(async resolve => {
  await removePageTemplate.then(() => {
    runCli(['add', 'template'], {
      template: {
        type: 'partial',
        prefix: 'header',
        name: 'Navigation',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

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

const removePartialTemplate = new Promise(async resolve => {
  await addPartialTemplate.then(() => {
    runCli(['remove', 'template'], {
      templates: [
        {
          type: 'partial',
          file: 'header-navigation.php'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

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
const addComponent = new Promise(async resolve => {
  await removePartialTemplate.then(() => {
    runCli(['add', 'component'], {
      component: {
        name: 'Example Component',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

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

const removeComponent = new Promise(async resolve => {
  await addComponent.then(() => {
    runCli(['remove', 'component'], {
      components: ['example-component']
    }).then(() => {
      resolve()
    })
  })
})

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
const addMenu = new Promise(async resolve => {
  await removeComponent.then(() => {
    runCli(['add', 'menu'], {
      menu: {
        name: 'Primary',
        description: 'Example Description',
        walker: true
      }
    }).then(() => {
      resolve()
    })
  })
})

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

const removeMenu = new Promise(async resolve => {
  await addMenu.then(() => {
    runCli(['remove', 'menu'], {
      menus: ['primary']
    }).then(() => {
      resolve()
    })
  })
})

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
const addWidget = new Promise(async resolve => {
  await removeMenu.then(() => {
    runCli(['add', 'widget'], {
      widget: {
        name: 'New Widget',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

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

const removeWidget = new Promise(async resolve => {
  await addWidget.then(() => {
    runCli(['remove', 'widget'], {
      widgets: ['new-widget']
    }).then(() => {
      resolve()
    })
  })
})

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
 * Add and remove img size
 */
const addImgSize = new Promise(async resolve => {
  /* eslint-disable quote-props */
  /* eslint-disable camelcase */
  await removeWidget.then(() => {
    runCli(['add', 'imgsize'], {
      imgsize: {
        name: 'Example Size',
        width: 250,
        height: 250,
        crop: true,
        customcrop: true,
        pos: {
          x: 'center',
          y: 'center'
        }
      }
    }).then(() => {
      resolve()
    })
  })
  /* eslint-enable quote-props camelcase */
})

test('`deux add imgsize`: should be succeed.', async t => {
  await addImgSize.then(() => {
    t.pass()
  })
})

test('`deux add imgsize`: config should be valid.', async t => {
  await addImgSize.then(() => {
    const _config = getConfig()
    t.deepEqual({
      'example-size': {
        name: 'Example Size',
        width: 250,
        height: 250,
        crop: {
          x: 'center',
          y: 'center'
        }
      }
    }, _config.phpConfig.imgsize)
  })
})

const removeImgSize = new Promise(async resolve => {
  await addImgSize.then(() => {
    runCli(['remove', 'imgsize'], {
      imgsize: ['example-size']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove imgsize`: should be succeed.', async t => {
  await removeImgSize.then(() => {
    t.pass()
  })
})

test('`deux remove imgsize`: config should be valid.', async t => {
  await removeImgSize.then(() => {
    const _config = getConfig()
    t.deepEqual({}, _config.phpConfig.imgsize)
  })
})

/**
 * Add and remove helper.
 */
const addHelper = new Promise(async resolve => {
  await removeImgSize.then(() => {
    runCli(['add', 'helper'], {
      helper: {
        name: 'Example Helper',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add helper`: should be succeed.', async t => {
  await addHelper.then(() => {
    t.pass()
  })
})

test('`deux add helper`: config should be valid.', async t => {
  await addHelper.then(() => {
    const _config = getConfig()
    t.true(_config.phpConfig.helpers.includes('example-helper'))
  })
})

test('`deux add helper`: file should be exists.', async t => {
  await addHelper.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'helpers', 'example-helper.php')))
  })
})

const removeHelper = new Promise(async resolve => {
  await addHelper.then(() => {
    runCli(['remove', 'helper'], {
      helpers: ['example-helper']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove helper`: should be succeed.', async t => {
  await removeHelper.then(() => {
    t.pass()
  })
})

test('`deux remove helper`: config should be valid.', async t => {
  await removeHelper.then(() => {
    const _config = getConfig()
    t.false(_config.phpConfig.helpers.includes('example-helper'))
  })
})

test('`deux remove helper`: file should be deleted.', async t => {
  await removeHelper.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'helpers', 'example-helper.php')))
  })
})

/**
 * Add and remove php libraries.
 */
const addLibClass = new Promise(async resolve => {
  await removeHelper.then(() => {
    runCli(['add', 'libclass'], {
      lib: {
        name: 'Example',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

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

const removeLibClass = new Promise(async resolve => {
  await addLibClass.then(() => {
    runCli(['remove', 'libclass'], {
      libraries: ['class-example']
    }).then(() => {
      resolve()
    })
  })
})

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

/**
 * Add and remove php libraries.
 */
const addFilter = new Promise(async resolve => {
  await removeLibClass.then(() => {
    runCli(['add', 'hooks'], {
      hooks: {
        type: 'filter',
        name: 'Example Content',
        description: 'Example Description',
        tag: 'the_content',
        priority: 10
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add hooks` (FILTER): should be succeed.', async t => {
  await addFilter.then(() => {
    t.pass()
  })
})

test('`deux add hooks` (FILTER): config should be valid.', async t => {
  await addFilter.then(() => {
    const _config = getConfig()
    t.true(_config.phpConfig.filters.includes('example-content'))
  })
})

test('`deux add hooks` (FILTER): file should be exists.', async t => {
  await addFilter.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'filters', 'example-content.php')))
  })
})

const removeFilter = new Promise(async resolve => {
  await addFilter.then(() => {
    runCli(['remove', 'hooks'], {
      hooks: [{type: 'filter', file: 'example-content'}]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove hooks` (FILTER): should be succeed.', async t => {
  await removeFilter.then(() => {
    t.pass()
  })
})

test('`deux remove hooks` (FILTER): config should be valid.', async t => {
  await removeFilter.then(() => {
    const _config = getConfig()
    t.false(_config.phpConfig.filters.includes('example-content'))
  })
})

test('`deux remove hooks` (FILTER): file should be deleted.', async t => {
  await removeFilter.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'filters', 'example-content.php')))
  })
})

const addAction = new Promise(async resolve => {
  await removeFilter.then(() => {
    runCli(['add', 'hooks'], {
      hooks: {
        type: 'action',
        name: 'Example Action',
        description: 'Example Description',
        tag: 'init',
        priority: 10
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add hooks` (ACTION): should be succeed.', async t => {
  await addAction.then(() => {
    t.pass()
  })
})

test('`deux add hooks` (ACTION): config should be valid.', async t => {
  await addAction.then(() => {
    const _config = getConfig()
    t.true(_config.phpConfig.actions.includes('example-action'))
  })
})

test('`deux add hooks` (ACTION): file should be exists.', async t => {
  await addAction.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'actions', 'example-action.php')))
  })
})

const removeAction = new Promise(async resolve => {
  await addAction.then(() => {
    runCli(['remove', 'hooks'], {
      hooks: [
        {
          type: 'action',
          file: 'example-action'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove hooks` (ACTION): should be succeed.', async t => {
  await removeAction.then(() => {
    t.pass()
  })
})

test('`deux remove hooks` (ACTION): config should be valid.', async t => {
  await removeAction.then(() => {
    const _config = getConfig()
    t.false(_config.phpConfig.actions.includes('example-action'))
  })
})

test('`deux remove hooks` (ACTION): file should be deleted.', async t => {
  await removeAction.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'actions', 'example-action.php')))
  })
})

/**
 * Add and remove features.
 */
const addhtml5Feature = new Promise(async resolve => {
  await removeAction.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'html5',
        options: [
          'comment-list',
          'comment-form',
          'search-form',
          'gallery',
          'caption'
        ]
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (HTML 5): should be succeed.', async t => {
  await addhtml5Feature.then(() => {
    t.pass()
  })
})

test('`deux add feature` (HTML 5): config should be valid.', async t => {
  await addhtml5Feature.then(() => {
    const _config = getConfig()
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'html5': [
        'comment-list',
        'comment-form',
        'search-form',
        'gallery',
        'caption'
      ]
      /* eslint-enable quote-props camelcase */
    }, _config.phpConfig.features)
  })
})
