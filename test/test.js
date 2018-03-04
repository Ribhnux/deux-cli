import path from 'path'
import {existsSync} from 'fs'
import test from 'ava'
import jsonar from 'jsonar'
import {wpPath, themePath} from './fixtures'
import {getConfig, cleanupTheme, cleanupDb, runCli} from './helpers'

const config = {
  wpPath,
  devUrl: 'http://wp.dev'
}

if (process.env.GOOGLE_API_KEY) {
  config.fontApiKey = process.env.GOOGLE_API_KEY
}

test.before('Cleanup db before init', async () => {
  if (!process.env.GIT_USERNAME && !process.env.GIT_PASSWORD) {
    throw new Error('Need Git Credentials from Environment: GIT_USERNAME and GIT_PASSWORD.')
  }

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
test('`deux` (Init): Error config should be fail.', async t => {
  const badConfig = JSON.stringify(config) + '}'
  await runCli([], badConfig).catch(() => t.pass())
})

const initTheme = new Promise(async resolve => {
  await runCli([], config).then(() => {
    resolve()
  }).catch(err => {
    console.log(err)
  })
})

test('`deux` (Init): Correct config should be succeed.', async t => {
  await initTheme.then(() => {
    t.pass()
  }).catch(err => {
    console.log(err)
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
        tags: 'full-width-template, blog'
      },
      git: {
        url: 'https://github.com/RibhnuxDesign/ramen-theme.git',
        username: process.env.GIT_USERNAME,
        password: process.env.GIT_PASSWORD
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
    optimize: true,
    asset: {
      libs: {},
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

  await addNewTheme.then(() => {
    const _config = getConfig()
    t.is(_config.slug, 'deux-theme')
    t.true(existsSync(_config.path))

    delete _config.themeConfig.asset.sass
    delete _config.themeConfig.releases
    delete _config.themeConfig.repo
    t.deepEqual(config, _config.themeConfig)

    delete config.details
    t.deepEqual(config, _config.phpConfig)
  })
})

test('`deux new`: Directory structures should be valid.', async t => {
  await addNewTheme.then(() => {
    // Assets.
    t.true(existsSync(path.join(themePath, 'assets')))
    t.true(existsSync(path.join(themePath, 'assets', 'js')))
    t.true(existsSync(path.join(themePath, 'assets', 'css')))
    t.true(existsSync(path.join(themePath, 'assets', 'images')))
    t.true(existsSync(path.join(themePath, 'assets', 'vendors')))

    // Assets source.
    t.true(existsSync(path.join(themePath, 'assets-src')))
    t.true(existsSync(path.join(themePath, 'assets-src', 'sass')))
    t.true(existsSync(path.join(themePath, 'assets-src', 'js')))

    // Templates
    t.true(existsSync(path.join(themePath, 'components')))
    t.true(existsSync(path.join(themePath, 'page-templates')))
    t.true(existsSync(path.join(themePath, 'partial-templates')))

    // Includes.
    t.true(existsSync(path.join(themePath, 'includes')))
    t.true(existsSync(path.join(themePath, 'includes', 'actions')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer')))
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

test('`deux add template` (Page): should be succeed.', async t => {
  await addPageTemplate.then(() => {
    t.pass()
  })
})

test('`deux add template` (Page): template file should be exists.', async t => {
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

test('`deux remove template` (Page): should be succeed.', async t => {
  await removePageTemplate.then(() => {
    t.pass()
  })
})

test('`deux remove template` (Page): template file should be deleted.', async t => {
  await removePageTemplate.then(() => {
    t.false(existsSync(path.join(themePath, 'page-templates', 'full-width.php')))
  })
})

const addPartialTemplate = new Promise(async resolve => {
  await removePageTemplate.then(() => {
    runCli(['add', 'template'], {
      template: {
        type: 'partial',
        dir: 'header',
        name: 'Topbar',
        description: 'Example Description'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add template` (Partial): should be succeed.', async t => {
  await addPartialTemplate.then(() => {
    t.pass()
  })
})

test('`deux add template` (Partial): template file should be exists.', async t => {
  await addPartialTemplate.then(() => {
    t.true(existsSync(path.join(themePath, 'partial-templates', 'header', 'topbar.php')))
  })
})

const removePartialTemplate = new Promise(async resolve => {
  await addPartialTemplate.then(() => {
    runCli(['remove', 'template'], {
      templates: [
        {
          type: 'partial',
          dir: 'header',
          file: 'topbar.php'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove template` (Partial): should be succeed.', async t => {
  await removePartialTemplate.then(() => {
    t.pass()
  })
})

test('`deux remove template` (Partial): template file should be deleted.', async t => {
  await removePartialTemplate.then(() => {
    t.false(existsSync(path.join(themePath, 'partial-templates', 'header', 'topbar.php')))
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
    t.true(getConfig('components').includes('example-component'))
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

test('`deux remove component`: config should be removed.', async t => {
  await removeComponent.then(() => {
    t.false(getConfig('components').includes('example-component'))
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
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'primary': {
        walker: true,
        name: jsonar.literal(`__( 'Primary', 'deux-theme' )`),
        description: jsonar.literal(`__( 'Example Description', 'deux-theme' )`)
      }
      /* eslint-enable quote-props camelcase */
    }, getConfig('menus'))
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

test('`deux remove menu`: config should be removed.', async t => {
  await removeMenu.then(() => {
    t.deepEqual({}, getConfig('menus'))
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
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'new-widget': {
        name: jsonar.literal(`__( 'New Widget', 'deux-theme' )`),
        description: jsonar.literal(`__( 'Example Description', 'deux-theme' )`),
        class: '',
        before_widget: '<section id="%1$s" class="widget %2$s">',
        after_widget: '</section>',
        before_title: '<h2 class="widget-title">',
        after_title: '</h2>'
      }
      /* eslint-enable quote-props camelcase */
    }, getConfig('widgets'))
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

test('`deux remove widget`: config should be removed.', async t => {
  await removeWidget.then(() => {
    t.deepEqual({}, getConfig('widgets'))
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
    }, getConfig('imgsize'))
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

test('`deux remove imgsize`: config should be removed.', async t => {
  await removeImgSize.then(() => {
    t.deepEqual({}, getConfig('imgsize'))
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
    t.true(getConfig('helpers').includes('example-helper'))
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

test('`deux remove helper`: config should be removed.', async t => {
  await removeHelper.then(() => {
    t.false(getConfig('helpers').includes('example-helper'))
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
    t.true(getConfig('libraries').includes('class-example'))
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

test('`deux remove libclass`: config should be removed.', async t => {
  await removeLibClass.then(() => {
    t.false(getConfig('libraries').includes('class-example'))
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

test('`deux add hooks` (Filter): should be succeed.', async t => {
  await addFilter.then(() => {
    t.pass()
  })
})

test('`deux add hooks` (Filter): config should be valid.', async t => {
  await addFilter.then(() => {
    t.true(getConfig('filters').includes('example-content'))
  })
})

test('`deux add hooks` (Filter): file should be exists.', async t => {
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

test('`deux remove hooks` (Filter): should be succeed.', async t => {
  await removeFilter.then(() => {
    t.pass()
  })
})

test('`deux remove hooks` (Filter): config should be removed.', async t => {
  await removeFilter.then(() => {
    t.false(getConfig('filters').includes('example-content'))
  })
})

test('`deux remove hooks` (Filter): file should be deleted.', async t => {
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

test('`deux add hooks` (Action): should be succeed.', async t => {
  await addAction.then(() => {
    t.pass()
  })
})

test('`deux add hooks` (Action): config should be valid.', async t => {
  await addAction.then(() => {
    t.true(getConfig('actions').includes('example-action'))
  })
})

test('`deux add hooks` (Action): file should be exists.', async t => {
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

test('`deux remove hooks` (Action): should be succeed.', async t => {
  await removeAction.then(() => {
    t.pass()
  })
})

test('`deux remove hooks` (Action): config should be removed.', async t => {
  await removeAction.then(() => {
    t.false(getConfig('actions').includes('example-action'))
  })
})

test('`deux remove hooks` (Action): file should be deleted.', async t => {
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

test('`deux add feature` (HTML5): should be succeed.', async t => {
  await addhtml5Feature.then(() => {
    t.pass()
  })
})

const addPostFormatFeature = new Promise(async resolve => {
  await addhtml5Feature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'post-formats',
        options: [
          'aside',
          'gallery',
          'link',
          'image',
          'quote',
          'status',
          'video',
          'audio',
          'chat'
        ]
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Post Formats): should be succeed.', async t => {
  await addPostFormatFeature.then(() => {
    t.pass()
  })
})

const addPostThumbnailFeature = new Promise(async resolve => {
  await addPostFormatFeature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'post-thumbnails',
        posttype: false,
        options: [
          'post',
          'book',
          'custom-post-type'
        ]
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Post Thumbnails): should be succeed.', async t => {
  await addPostThumbnailFeature.then(() => {
    t.pass()
  })
})

const addCustomBackgroundFeature = new Promise(async resolve => {
  await addPostThumbnailFeature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'custom-background',
        options: {
          imageUrl: 'http://imageurl.com/image.jpg',
          color: '#fff',
          preset: 'custom',
          position: {
            x: 'center',
            y: 'center'
          },
          imageSize: 'contain',
          repeat: true,
          attachment: 'fixed',
          wpHeadCallback: true
        },
        advanced: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Custom Background): should be succeed.', async t => {
  await addCustomBackgroundFeature.then(() => {
    t.pass()
  })
})

test('`deux add feature` (Custom Background): `wp_head` callback helper file should be exists.', async t => {
  await addCustomBackgroundFeature.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'helpers', 'custom-background.php')))
  })
})

const addCustomHeaderFeature = new Promise(async resolve => {
  await addCustomBackgroundFeature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'custom-header',
        options: {
          imageUrl: 'assets/images/header.jpg',
          width: 2000,
          height: 1200,
          flexWidth: true,
          flexHeight: true,
          random: true,
          headerText: true,
          textColor: '#fff',
          video: true,
          videoAlwaysActive: false,
          wpHeadCallback: true
        },
        advanced: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Custom Header): should be succeed.', async t => {
  await addCustomHeaderFeature.then(() => {
    t.pass()
  })
})

test('`deux add feature` (Custom Header): `wp_head` callback helper file should be exists.', async t => {
  await addCustomHeaderFeature.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'helpers', 'custom-header.php')))
  })
})

test('`deux add feature` (Custom Header): video active callback helper file should be exists.', async t => {
  await addCustomHeaderFeature.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'helpers', 'custom-header-video.php')))
  })
})

const addCustomLogoFeature = new Promise(async resolve => {
  await addCustomHeaderFeature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'custom-logo',
        options: {
          width: 250,
          height: 250,
          flexWidth: true,
          flexHeight: true
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Custom Logo): should be succeed.', async t => {
  await addCustomLogoFeature.then(() => {
    t.pass()
  })
})

const addWoocommerceFeature = new Promise(async resolve => {
  await addCustomLogoFeature.then(() => {
    runCli(['add', 'feature'], {
      feature: {
        type: 'woocommerce'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add feature` (Woocommerce): should be succeed.', async t => {
  await addWoocommerceFeature.then(() => {
    t.pass()
  })
})

test('`deux add feature`: config should be valid.', async t => {
  await addWoocommerceFeature.then(() => {
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'html5': [
        'comment-list',
        'comment-form',
        'search-form',
        'gallery',
        'caption'
      ],
      'post-formats': [
        'aside',
        'gallery',
        'link',
        'image',
        'quote',
        'status',
        'video',
        'audio',
        'chat'
      ],
      'post-thumbnails': [
        'post',
        'book',
        'custom-post-type'
      ],
      'custom-background': {
        'default-image': 'http://imageurl.com/image.jpg',
        'default-color': '#fff',
        'default-preset': 'custom',
        'default-position-x': 'center',
        'default-position-y': 'center',
        'default-size': 'contain',
        'default-repeat': true,
        'default-attachment': 'fixed',
        'wp-head-callback': 'deux_theme_custom_background_callback'
      },
      'custom-header': {
        'default-image': jsonar.literal(`get_parent_theme_file_uri( 'assets/images/header.jpg' )`),
        'width': 2000,
        'height': 1200,
        'flex-width': true,
        'flex-height': true,
        'header-text': true,
        'random-default': true,
        'uploads': true,
        'video': true,
        'default-text-color': '#fff',
        'video-active-callback': 'deux_theme_video_active_callback',
        'wp-head-callback': 'deux_theme_custom_header_callback'
      },
      'custom-logo': {
        'width': 250,
        'height': 250,
        'flex-width': true,
        'flex-height': true,
        'header-text': ''
      },
      'woocommerce': true
      /* eslint-enable quote-props camelcase */
    }, getConfig('features'))
  })
})

const removeHTML5Feature = new Promise(async resolve => {
  await addWoocommerceFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['html5']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (HTML5): should be succeed.', async t => {
  await removeHTML5Feature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (HTML5): config should be removed.', async t => {
  await removeHTML5Feature.then(() => {
    t.false('html5' in getConfig('features'))
  })
})

const removePostFormatFeature = new Promise(async resolve => {
  await removeHTML5Feature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['post-formats']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (Post Formats): should be succeed.', async t => {
  await removePostFormatFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (Post Formats): config should be removed.', async t => {
  await removePostFormatFeature.then(() => {
    t.false('post-formats' in getConfig('features'))
  })
})

const removePostThumbnailsFeature = new Promise(async resolve => {
  await removePostFormatFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['post-thumbnails']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (Post Thumbnails): should be succeed.', async t => {
  await removePostThumbnailsFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (Post Thumbnails): config should be removed.', async t => {
  await removePostThumbnailsFeature.then(() => {
    t.false('post-thumbnails' in getConfig('features'))
  })
})

const removeCustomBackgroundFeature = new Promise(async resolve => {
  await removePostThumbnailsFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['custom-background']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (Custom Background): should be succeed.', async t => {
  await removeCustomBackgroundFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (Custom Background): config should be removed.', async t => {
  await removeCustomBackgroundFeature.then(() => {
    t.false('custom-background' in getConfig('features'))
  })
})

const removeCustomHeaderFeature = new Promise(async resolve => {
  await removeCustomBackgroundFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['custom-header']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (Custom Header): should be succeed.', async t => {
  await removeCustomHeaderFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (Custom Header): config should be removed.', async t => {
  await removeCustomHeaderFeature.then(() => {
    t.false('custom-header' in getConfig('features'))
  })
})

const removeCustomLogoFeature = new Promise(async resolve => {
  await removeCustomHeaderFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['custom-logo']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (Custom Logo): should be succeed.', async t => {
  await removeCustomLogoFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (Custom Logo): config should be removed.', async t => {
  await removeCustomLogoFeature.then(() => {
    t.false('custom-logo' in getConfig('features'))
  })
})

const removeWoocommerceFeature = new Promise(async resolve => {
  await removeCustomLogoFeature.then(() => {
    runCli(['remove', 'feature'], {
      features: ['woocommerce']
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove feature` (WooCommerce): should be succeed.', async t => {
  await removeWoocommerceFeature.then(() => {
    t.pass()
  })
})

test('`deux remove feature` (WooCommerce): config should be removed.', async t => {
  await removeWoocommerceFeature.then(() => {
    t.false('woocommerce' in getConfig('features'))
  })
})

/**
 * Add and remove plugins.
 */
const addPluginWoocommerce = new Promise(async resolve => {
  await removeWoocommerceFeature.then(() => {
    runCli(['add', 'plugin'], {
      plugin: {
        srctype: 'wp',
        search: 'woocommerce',
        item: {
          name: 'WooCommerce',
          slug: 'woocommerce',
          description: 'Description',
          version: '3.2.5',
          versions: {
            '3.2.5': 'https://downloads.wordpress.org/plugin/woocommerce.3.2.5.zip',
            trunk: 'https://downloads.wordpress.org/plugin/woocommerce.zip'
          }
        },
        versions: {
          value: '3.2.5',
          source: 'https://downloads.wordpress.org/plugin/woocommerce.3.2.5.zip'
        },
        required: true,
        force_activation: false,
        force_deactivation: false,
        init: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add plugin` (WordPress Repository): should be succeed.', async t => {
  await addPluginWoocommerce.then(() => {
    t.pass()
  })
})

test('`deux add plugin` (WordPress Repository): plugin related file should be exists.', async t => {
  await addPluginWoocommerce.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'plugins', 'woocommerce.php')))
  })
})

const addPluginPrivate = new Promise(async resolve => {
  await addPluginWoocommerce.then(() => {
    runCli(['add', 'plugin'], {
      plugin: {
        srctype: 'private',
        name: 'Test',
        source: 'https://downloads.wordpress.org/plugin/woocommerce.3.2.5.zip',
        slug: 'test',
        version: '1.0.0',
        description: 'Description About Anything',
        external_url: 'https://baba.com',
        required: true,
        force_activation: false,
        force_deactivation: false,
        init: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add plugin` (Private Repository): should be succeed.', async t => {
  await addPluginPrivate.then(() => {
    t.pass()
  })
})

test('`deux add plugin` (Private Repository): plugin related file should be exists.', async t => {
  await addPluginPrivate.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'plugins', 'test.php')))
  })
})

test('`deux add plugin`: config should be valid.', async t => {
  await addPluginPrivate.then(() => {
    t.deepEqual({
      /* eslint-disable quote-props */
      /* eslint-disable camelcase */
      'woocommerce': {
        'srctype': 'wp',
        'required': true,
        'force_activation': false,
        'force_deactivation': false,
        'init': true,
        'name': 'Woocommerce',
        'description': 'Description',
        'source': 'https://downloads.wordpress.org/plugin/woocommerce.3.2.5.zip',
        'version': '3.2.5'
      },
      'test': {
        'srctype': 'private',
        'name': 'Test',
        'source': 'https://downloads.wordpress.org/plugin/woocommerce.3.2.5.zip',
        'version': '1.0.0',
        'description': 'Description About Anything',
        'required': true,
        'force_activation': false,
        'force_deactivation': false,
        'init': true
      }
      /* eslint-enable quote-props camelcase */
    }, getConfig('plugins'))
  })
})

const removePluginWordPress = new Promise(async resolve => {
  await addPluginPrivate.then(() => {
    runCli(['remove', 'plugin'], {
      plugins: [
        'woocommerce'
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove plugin` (WordPress Repository): should be succeed.', async t => {
  await removePluginWordPress.then(() => {
    t.pass()
  })
})

test('`deux remove plugin` (WordPress Repository): config should be removed.', async t => {
  await removePluginWordPress.then(() => {
    t.false('woocommerce' in getConfig('plugins'))
  })
})

const removePluginPrivate = new Promise(async resolve => {
  await removePluginWordPress.then(() => {
    runCli(['remove', 'plugin'], {
      plugins: [
        'test'
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove plugin` (Private Repository): should be succeed.', async t => {
  await removePluginPrivate.then(() => {
    t.pass()
  })
})

test('`deux remove plugin` (Private Repository): config should be removed.', async t => {
  await removePluginPrivate.then(() => {
    t.false('test' in getConfig('plugins'))
  })
})

const addAssetCDN = new Promise(async resolve => {
  await removePluginPrivate.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'lib'
      },

      lib: {
        source: 'cdn',
        search: 'bootstrap',
        name: {
          handle: 'twitter-bootstrap'
        },
        version: '4.0.0-beta.2',
        files: [
          'css/bootstrap.min.css',
          'js/bootstrap.min.js'
        ],
        deps: 'jquery'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (Bootstrap from CDN): should be succeed.', async t => {
  await addAssetCDN.then(() => {
    t.pass()
  })
})

test('`deux add asset` (Bootstrap from CDN): asset file should be exists.', async t => {
  await addAssetCDN.then(() => {
    t.true(existsSync(path.join(themePath, 'assets', 'vendors', 'twitter-bootstrap', 'css', 'bootstrap.min.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'vendors', 'twitter-bootstrap', 'js', 'bootstrap.min.js')))
    t.true(existsSync(path.join(themePath, 'assets-src', 'sass', 'vendors', '_twitter-bootstrap.scss')))
  })
})

const addAssetjQuery = new Promise(async resolve => {
  await addAssetCDN.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'lib'
      },

      lib: {
        source: 'wp',
        name: {
          handle: 'jquery'
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (jQuery from WordPress): should be succeed.', async t => {
  await addAssetjQuery.then(() => {
    t.pass()
  })
})

const addAssetjQueryMasonry = new Promise(async resolve => {
  await addAssetjQuery.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'lib'
      },

      lib: {
        source: 'wp',
        name: {
          handle: 'jquery-masonry',
          deps: [
            'jquery'
          ]
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (jQuery Masonry from WordPress): should be succeed.', async t => {
  await addAssetjQueryMasonry.then(() => {
    t.pass()
  })
})

const addAssetURL = new Promise(async resolve => {
  await addAssetjQueryMasonry.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'lib'
      },

      lib: {
        source: 'url',
        name: 'Hint CSS',
        version: '2.5.0',
        url: 'https://raw.githubusercontent.com/chinchang/hint.css/ee20a62cca41e501de21d28d36eef92b9bf10bed/hint.min.css',
        deps: ''
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (hint.css from Custom URL): should be succeed.', async t => {
  await addAssetURL.then(() => {
    t.pass()
  })
})

test('`deux add asset` (hint.css from Custom URL): asset file should be exists.', async t => {
  await addAssetURL.then(() => {
    t.true(existsSync(path.join(themePath, 'assets', 'vendors', 'hint-css', 'hint.min.css')))
    t.true(existsSync(path.join(themePath, 'assets-src', 'sass', 'vendors', '_hint-css.scss')))
  })
})

const addSASSComponent = new Promise(async resolve => {
  await addAssetURL.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'sass'
      },

      sass: {
        type: 'component',
        name: 'button',
        description: 'Test description.'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (sass component): should be succeed.', async t => {
  await addSASSComponent.then(() => {
    t.pass()
  })
})

test('`deux add asset` (sass component): asset file should be exists.', async t => {
  await addSASSComponent.then(() => {
    t.true(existsSync(path.join(themePath, 'assets-src', 'sass', 'components', '_button.scss')))
  })
})

const addSASSLayout = new Promise(async resolve => {
  await addSASSComponent.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'sass'
      },

      sass: {
        type: 'layout',
        name: 'grid',
        description: 'Test description.'
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (sass layout): should be succeed.', async t => {
  await addSASSLayout.then(() => {
    t.pass()
  })
})

test('`deux add asset` (sass layout): asset file should be exists.', async t => {
  await addSASSLayout.then(() => {
    t.true(existsSync(path.join(themePath, 'assets-src', 'sass', 'layouts', '_grid.scss')))
  })
})

const addWebFont = new Promise(async resolve => {
  await addSASSLayout.then(() => {
    runCli(['add', 'asset'], {
      asset: {
        type: 'font'
      },

      font: {
        source: 'search',
        search: 'montserrat',
        selected: {
          family: 'Montserrat',
          variantsFormat: [
            {
              value: 100,
              name: 'Thin',
              camelcase: 'thin',
              mini: 100,
              key: '100'
            },
            {
              value: 100,
              italic: true,
              name: 'Thin Italic',
              camelcase: 'thinItalic',
              mini: '100i',
              key: '100italic'
            },
            {
              value: 200,
              name: 'Extra Light',
              camelcase: 'extraLight',
              mini: 200,
              key: '200'
            },
            {
              value: 200,
              italic: true,
              name: 'Extra Light Italic',
              camelcase: 'extraLightItalic',
              mini: '200i',
              key: '200italic'
            },
            {
              value: 300,
              name: 'Light',
              camelcase: 'light',
              mini: 300,
              key: '300'
            },
            {
              value: 300,
              italic: true,
              name: 'Light Italic',
              camelcase: 'lightItalic',
              mini: '300i',
              key: '300italic'
            },
            {
              value: 400,
              alias: 'regular',
              name: 'Regular',
              camelcase: 'regular',
              mini: 400,
              key: 'regular'
            },
            {
              value: 400,
              italic: true,
              alias: 'italic',
              name: 'Italic',
              camelcase: 'italic',
              mini: 400,
              key: 'italic'
            },
            {
              value: 500,
              name: 'Medium',
              camelcase: 'medium',
              mini: 500,
              key: '500'
            },
            {
              value: 500,
              italic: true,
              name: 'Medium Italic',
              camelcase: 'mediumItalic',
              mini: '500i',
              key: '500italic'
            },
            {
              value: 600,
              name: 'Semi Bold',
              camelcase: 'semiBold',
              mini: 600,
              key: '600'
            },
            {
              value: 600,
              italic: true,
              name: 'Semi Bold Italic',
              camelcase: 'semiBoldItalic',
              mini: '600i',
              key: '600italic'
            },
            {
              value: 700,
              name: 'Bold',
              camelcase: 'bold',
              mini: 700,
              key: '700'
            },
            {
              value: 700,
              italic: true,
              name: 'Bold Italic',
              camelcase: 'boldItalic',
              mini: '700i',
              key: '700italic'
            },
            {
              value: 800,
              name: 'Extra Bold',
              camelcase: 'extraBold',
              mini: 800,
              key: '800'
            },
            {
              value: 800,
              italic: true,
              name: 'Extra Bold Italic',
              camelcase: 'extraBoldItalic',
              mini: '800i',
              key: '800italic'
            },
            {
              value: 900,
              name: 'Black',
              camelcase: 'black',
              mini: 900,
              key: '900'
            },
            {
              value: 900,
              italic: true,
              name: 'Black Italic',
              camelcase: 'blackItalic',
              mini: '900i',
              key: '900italic'
            }
          ],
          subsets: [
            'latin',
            'cyrillic',
            'cyrillic-ext',
            'vietnamese',
            'latin-ext'
          ]
        },
        variants: [
          {
            value: 100,
            name: 'Thin',
            camelcase: 'thin',
            mini: 100,
            key: '100'
          },
          {
            value: 300,
            name: 'Light',
            camelcase: 'light',
            mini: 300,
            key: '300'
          },
          {
            value: 400,
            alias: 'regular',
            name: 'Regular',
            camelcase: 'regular',
            mini: 400,
            key: 'regular'
          },
          {
            value: 600,
            name: 'Semi Bold',
            camelcase: 'semiBold',
            mini: 600,
            key: '600'
          },
          {
            value: 700,
            name: 'Bold',
            camelcase: 'bold',
            mini: 700,
            key: '700'
          }
        ],
        subsets: [
          'latin',
          'latin-ext'
        ]
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add asset` (Montserrat webfont): should be succeed.', async t => {
  await addWebFont.then(() => {
    t.pass()
  })
})

test('`deux add asset`: config should be valid', async t => {
  await addWebFont.then(() => {
    t.deepEqual({
      libs: {
        'twitter-bootstrap': {
          source: 'cdn',
          search: 'bootstrap',
          version: '4.0.0-beta.2',
          files: [
            {
              ext: 'css',
              path: 'css/bootstrap.min.css',
              is_active: true,
              deps: []
            },
            {
              ext: 'js',
              path: 'js/bootstrap.min.js',
              is_active: true,
              deps: [
                'jquery'
              ]
            }
          ]
        },
        jquery: {
          source: 'wp',
          deps: []
        },
        'jquery-masonry': {
          source: 'wp',
          deps: [
            'jquery'
          ]
        },
        'hint-css': {
          source: 'url',
          version: '2.5.0',
          files: [
            {
              ext: 'css',
              path: 'https://raw.githubusercontent.com/chinchang/hint.css/ee20a62cca41e501de21d28d36eef92b9bf10bed/hint.min.css',
              is_active: true,
              deps: []
            }
          ]
        }
      },
      fonts: {
        montserrat: {
          name: 'Montserrat',
          variants: [
            '100',
            '300',
            '400',
            '600',
            '700'
          ],
          subsets: [
            'latin',
            'latin-ext'
          ]
        }
      }
    }, getConfig('asset'))
  })
})

const removeAssetCDN = new Promise(async resolve => {
  await addWebFont.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'lib',
          slug: 'twitter-bootstrap'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (Bootstrap from CDN): should be succeed.', async t => {
  await removeAssetCDN.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (Bootstrap from CDN): asset file should be deleted.', async t => {
  await removeAssetCDN.then(() => {
    t.false(existsSync(path.join(themePath, 'assets', 'vendors', 'twitter-bootstrap')))
    t.false(existsSync(path.join(themePath, 'assets-src', 'sass', '_twitter-bootstrap.scss')))
  })
})

test('`deux remove asset` (Bootstrap from CDN): config should be removed.', async t => {
  await removeAssetCDN.then(() => {
    t.false('twitter-bootstrap' in getConfig('asset').libs)
  })
})

const removeAssetjQuery = new Promise(async resolve => {
  await removeAssetCDN.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'lib',
          slug: 'jquery'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (jQuery from WordPress): should be succeed.', async t => {
  await removeAssetjQuery.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (jQuery from WordPress): config should be removed.', async t => {
  await removeAssetjQuery.then(() => {
    t.false('jquery' in getConfig('asset').libs)
  })
})

const removeAssetjQueryMasonry = new Promise(async resolve => {
  await removeAssetjQuery.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'lib',
          slug: 'jquery-masonry'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (jQuery Masonry from WordPress): should be succeed.', async t => {
  await removeAssetjQueryMasonry.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (jQuery Masonry from WordPress): config should be removed.', async t => {
  await removeAssetjQueryMasonry.then(() => {
    t.false('jquery-masonry' in getConfig('asset').libs)
  })
})

const removeAssetHintCSS = new Promise(async resolve => {
  await removeAssetjQueryMasonry.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'lib',
          slug: 'hint-css'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (hint.css from Custom URL): should be succeed.', async t => {
  await removeAssetHintCSS.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (hint.css from Custom URL): asset file should be deleted.', async t => {
  await removeAssetHintCSS.then(() => {
    t.false(existsSync(path.join(themePath, 'assets', 'vendors', 'hint-css')))
    t.false(existsSync(path.join(themePath, 'assets-src', 'sass', 'vendors', '_hint-css.scss')))
  })
})

test('`deux remove asset` (hint.css from Custom URL): config should be removed.', async t => {
  await removeAssetHintCSS.then(() => {
    t.false('hint-css' in getConfig('asset').libs)
  })
})

const removeSASSComponent = new Promise(async resolve => {
  await removeAssetHintCSS.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'sass',
          type: 'components',
          value: 'button'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (sass component): should be succeed.', async t => {
  await removeSASSComponent.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (sass component): asset file should be deleted.', async t => {
  await removeSASSComponent.then(() => {
    t.false(existsSync(path.join(themePath, 'assets-src', 'sass', 'components', '_button.scss')))
  })
})

const removeSASSLayout = new Promise(async resolve => {
  await removeSASSComponent.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'sass',
          type: 'layouts',
          value: 'grid'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (sass layout): should be succeed.', async t => {
  await removeSASSLayout.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (sass layout): asset file should be deleted.', async t => {
  await removeSASSLayout.then(() => {
    t.false(existsSync(path.join(themePath, 'assets-src', 'sass', 'layouts', '_grid.scss')))
  })
})

const removeAssetWebFont = new Promise(async resolve => {
  await removeSASSLayout.then(() => {
    runCli(['remove', 'asset'], {
      assets: [
        {
          key: 'font',
          value: 'montserrat'
        }
      ]
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove asset` (Montserrat webfont): should be succeed.', async t => {
  await removeAssetWebFont.then(() => {
    t.pass()
  })
})

test('`deux remove asset` (Montserrat webfont): config should be removed.', async t => {
  await removeAssetWebFont.then(() => {
    t.false('montserrat' in getConfig('asset').fonts)
  })
})

const addCustomizerSection = new Promise(async resolve => {
  await removeAssetWebFont.then(() => {
    runCli(['add', 'customizer'], {
      customizer: {
        setting: {
          name: 'Test',
          transport: 'refresh',
          default: ''
        },
        control: {
          description: 'Test Description',
          type: 'text',
          section: 'custom'
        },
        section: {
          title: 'Universe',
          description: 'Section Description',
          priority: 160,
          inPanel: false
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add customizer` (Section): should be succeed.', async t => {
  await addCustomizerSection.then(() => {
    t.pass()
  })
})

const addCustomizerColor = new Promise(async resolve => {
  await addCustomizerSection.then(() => {
    runCli(['add', 'customizer'], {
      customizer: {
        setting: {
          name: 'Primary Color',
          transport: 'refresh',
          default: '#cc0000'
        },
        control: {
          description: 'Theme Primary Color',
          type: 'color-picker',
          section: 'colors'
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add customizer` (Existing Section): should be succeed.', async t => {
  await addCustomizerColor.then(() => {
    t.pass()
  })
})

const addCustomizerPanel = new Promise(async resolve => {
  await addCustomizerColor.then(() => {
    runCli(['add', 'customizer'], {
      customizer: {
        setting: {
          name: 'New Setting',
          transport: 'refresh',
          default: ''
        },
        control: {
          description: 'Setting Description',
          type: 'text',
          section: 'custom'
        },
        section: {
          title: 'New Section',
          description: 'labore voluptatibus consectetur',
          priority: 160,
          inPanel: true,
          panel: 'custom'
        },
        panel: {
          title: 'New Panel',
          description: 'Panel Description',
          priority: 160
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add customizer` (New Section and New Panel): should be succeed.', async t => {
  await addCustomizerPanel.then(() => {
    t.pass()
  })
})

const addCustomizerControl = new Promise(async resolve => {
  await addCustomizerPanel.then(() => {
    runCli(['add', 'customizer'], {
      customizer: {
        setting: {
          name: 'Multiverse',
          transport: 'refresh',
          default: ''
        },
        control: {
          description: 'Setting Description',
          type: 'custom',
          section: 'new_section'
        },
        customControl: {
          name: 'Greeting',
          description: 'Control Description'
        }
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux add customizer` (Control Type): should be succeed.', async t => {
  await addCustomizerControl.then(() => {
    t.pass()
  })
})

test('`deux add customizer` (Control Type): control file be exists.', async t => {
  await addCustomizerControl.then(() => {
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'controls', 'class-wp-customize-greeting-control.php')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets-src', 'sass', 'controls', '_greeting.scss')))
  })
})

test('`deux add customizer`: config should be valid.', async t => {
  await addCustomizerControl.then(() => {
    t.deepEqual({
      /* eslint-disable camelcase */
      panels: {
        new_panel: {
          title: jsonar.literal(`__( 'New Panel', 'deux-theme' )`),
          description: jsonar.literal(`__( 'Panel Description', 'deux-theme' )`),
          priority: 160
        }
      },
      sections: {
        universe: {
          title: jsonar.literal(`__( 'Universe', 'deux-theme' )`),
          description_hidden: true,
          description: jsonar.literal(`__( 'Section Description', 'deux-theme' )`),
          priority: 160
        },
        new_section: {
          title: jsonar.literal(`__( 'New Section', 'deux-theme' )`),
          description_hidden: true,
          description: jsonar.literal(`__( 'labore voluptatibus consectetur', 'deux-theme' )`),
          priority: 160,
          panel: 'new_panel'
        }
      },
      settings: {
        test: {
          transport: 'refresh',
          default: ''
        },
        primary_color: {
          transport: 'refresh',
          default: '#cc0000'
        },
        new_setting: {
          transport: 'refresh',
          default: ''
        },
        multiverse: {
          transport: 'refresh',
          default: ''
        }
      },
      control_types: {
        'greeting': 'WP_Customize_Greeting_Control'
      },
      controls: {
        test_control: {
          settings: 'test',
          label: jsonar.literal(`__( 'Test', 'deux-theme' )`),
          description: jsonar.literal(`__( 'Test Description', 'deux-theme' )`),
          type: 'text',
          section: 'universe'
        },
        primary_color_control: {
          settings: 'primary_color',
          label: jsonar.literal(`__( 'Primary Color', 'deux-theme' )`),
          description: jsonar.literal(`__( 'Theme Primary Color', 'deux-theme' )`),
          type: 'color-picker',
          section: 'colors'
        },
        new_setting_control: {
          settings: 'new_setting',
          label: jsonar.literal(`__( 'New Setting', 'deux-theme' )`),
          description: jsonar.literal(`__( 'Setting Description', 'deux-theme' )`),
          type: 'text',
          section: 'new_section'
        },
        multiverse_control: {
          settings: 'multiverse',
          label: jsonar.literal(`__( 'Multiverse', 'deux-theme' )`),
          description: jsonar.literal(`__( 'Setting Description', 'deux-theme' )`),
          type: 'custom',
          section: 'new_section',
          custom_control: 'greeting'
        }
      }
      /* eslint-enable camelcase */
    }, getConfig('customizer'))
  })
})

const removeCustomizerPanel = new Promise(async resolve => {
  await addCustomizerControl.then(() => {
    runCli(['remove', 'customizer'], {
      customizer: {
        type: 'panel',
        panels: ['new_panel'],
        panelsChild: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove customizer` (Panel): should be succeed.', async t => {
  await removeCustomizerPanel.then(() => {
    t.pass()
  })
})

test('`deux remove customizer` (Panel): config should be removed.', async t => {
  await removeCustomizerPanel.then(() => {
    t.false('new_panel' in getConfig('customizer').panels)
    t.false('new_section' in getConfig('customizer').sections)
    t.false('new_setting_control' in getConfig('customizer').controls)
    t.false('multiverse_control' in getConfig('customizer').controls)
    t.false('new_setting' in getConfig('customizer').settings)
    t.false('multiverse' in getConfig('customizer').settings)
  })
})

const removeCustomizerSection = new Promise(async resolve => {
  await removeCustomizerPanel.then(() => {
    runCli(['remove', 'customizer'], {
      customizer: {
        type: 'section',
        sections: ['universe'],
        sectionsChild: true
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove customizer` (Section): should be succeed.', async t => {
  await removeCustomizerSection.then(() => {
    t.pass()
  })
})

test('`deux remove customizer` (Section): config should be removed.', async t => {
  await removeCustomizerSection.then(() => {
    t.false('universe' in getConfig('customizer').sections)
  })
})

const removeCustomizerSetting = new Promise(async resolve => {
  await removeCustomizerSection.then(() => {
    runCli(['remove', 'customizer'], {
      customizer: {
        type: 'setting',
        settings: ['primary_color']
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove customizer` (Setting): should be succeed.', async t => {
  await removeCustomizerSetting.then(() => {
    t.pass()
  })
})

test('`deux remove customizer` (Setting): config should be removed.', async t => {
  await removeCustomizerSetting.then(() => {
    t.false('primary_color' in getConfig('customizer').settings)
    t.false('primary_color_control' in getConfig('customizer').controls)
  })
})

const removeCustomizerControlType = new Promise(async resolve => {
  await removeCustomizerSetting.then(() => {
    runCli(['remove', 'customizer'], {
      customizer: {
        type: 'control_type',
        control_types: ['greeting']
      }
    }).then(() => {
      resolve()
    })
  })
})

test('`deux remove customizer` (Control Type): should be succeed.', async t => {
  await removeCustomizerControlType.then(() => {
    t.pass()
  })
})

test('`deux remove customizer` (Control Type): config should be removed.', async t => {
  await removeCustomizerControlType.then(() => {
    t.false('greeting' in getConfig('customizer').control_types)
  })
})

test('`deux remove customizer` (Control Type): control file should be removed.', async t => {
  await removeCustomizerControlType.then(() => {
    t.false(existsSync(path.join(themePath, 'includes', 'customizer', 'controls', 'class-wp-customize-greeting-control.php')))
    t.false(existsSync(path.join(themePath, 'includes', 'customizer', 'assets-src', 'sass', 'controls', '_greeting.scss')))
  })
})

const devBuildAsset = new Promise(async resolve => {
  await removeCustomizerControlType.then(() => {
    runCli(['dev', '--build'], {}).then(() => {
      resolve()
    }).catch(err => {
      console.log(err)
    })
  })
})

test('`deux dev --build`: should be succeed.', async t => {
  await devBuildAsset.then(() => {
    t.pass()
  })
})

test('`deux dev --build`: asset files should be compiled.', async t => {
  await devBuildAsset.then(() => {
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme.min.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme.min.css.map')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme-rtl.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme.min-rtl.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'theme.min-rtl.css.map')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'editor-style.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'editor-style.min.css')))
    t.true(existsSync(path.join(themePath, 'assets', 'css', 'editor-style.min.css.map')))
    t.true(existsSync(path.join(themePath, 'assets', 'js', 'theme.js')))
    t.true(existsSync(path.join(themePath, 'assets', 'js', 'theme.min.js')))
    t.true(existsSync(path.join(themePath, 'assets', 'js', 'theme.min.js.map')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer.css')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer.min.css')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer.min.css.map')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer-rtl.css')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer.min-rtl.css')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'css', 'customizer.min-rtl.css.map')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-preview.js')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-preview.min.js')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-preview.min.js.map')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-control.js')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-control.min.js')))
    t.true(existsSync(path.join(themePath, 'includes', 'customizer', 'assets', 'js', 'customizer-control.min.js.map')))
  })
})
