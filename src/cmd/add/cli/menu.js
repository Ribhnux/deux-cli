const faker = require('faker')
const slugify = require('node-slugify')
const rimraf = require('rimraf')
const jsonar = require('jsonar')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const validator = global.deuxhelpers.require('util/validator')
const {exit, finish} = global.deuxhelpers.require('logger')
const compileFile = global.deuxhelpers.require('compiler/single')
const {capitalize} = global.deuxhelpers.require('util/misc')

class AddMenu extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup add menu prompts
   */
  prepare() {
    this.title = 'Register {New Menu}'
    this.prompts = [
      {
        name: 'menu.name',
        message: 'Menu Name',
        default: 'Primary',
        validate: value => validator(value, {minimum: 3, var: 'Menu Name'})
      },

      {
        name: 'menu.description',
        message: 'Menu Description',
        default: faker.lorem.sentence(),
        validate: value => validator(value, {minimum: 3, word: true, var: `"${value}"`})
      },

      {
        type: 'confirm',
        name: 'menu.walker',
        message: 'Require Menu Navigation Walker?',
        default: false
      },

      {
        type: 'confirm',
        name: 'menu.overwrite',
        message: 'Menu already exists. Continue to overwrite?',
        default: true,
        when: ({menu}) => new Promise(resolve => {
          resolve(this.themeInfo('menus')[menu.location] !== undefined)
        })
      }
    ]
  }

  /**
   * Compile menu config
   *
   * @param {Object} {menu}
   */
  action({menu}) {
    if (menu.overwrite === false) {
      exit(messages.ERROR_MENU_ALREADY_EXISTS)
    }

    menu.location = slugify(menu.name)

    const themeDetails = this.themeDetails()
    const navWalkerFile = this.templateSourcePath('_partials', 'nav-walker.php')
    const slugCapital = menu.location.split('-').map(item => capitalize(item))
    const niceName = slugCapital.join(' ')
    const className = slugCapital.join('_')
    const menus = this.themeInfo('menus')
    let libraries = this.themeInfo('libraries')

    const walker = {
      name: `${niceName} Nav Walker`,
      file: `class-${slugify(menu.location)}-menu-nav-walker`,
      description: `${niceName} Menu Navigation Walker Class`,
      className: `${className}_Nav_Walker`
    }

    Promise.all([
      new Promise(resolve => {
        const navWalkerPath = this.currentThemePath('includes', 'libraries', `${walker.file}.php`)
        if (menu.walker) {
          compileFile({
            srcPath: navWalkerFile,
            dstPath: navWalkerPath,
            syntax: {
              theme: themeDetails,
              walker
            }
          })
          libraries.push(walker.file)
        } else {
          libraries = libraries.filter(item => item !== walker.file)
          rimraf.sync(navWalkerPath)
        }

        menus[menu.location] = {
          walker: menu.walker,
          name: menu.name,
          description: jsonar.literal(`__( '${menu.description}', '${themeDetails.slug}' )`)
        }

        resolve()
      }),

      new Promise(resolve => {
        this.setThemeConfig({
          menus,
          libraries: uniq(libraries)
        })

        resolve()
      })
    ]).then(
      finish(messages.SUCCEED_MENU_ADDED)
    ).catch(exit)
  }
}

module.exports = AddMenu
