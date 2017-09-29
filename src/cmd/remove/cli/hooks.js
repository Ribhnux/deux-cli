const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')
const uniq = require('lodash.uniq')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {hookTypes} = global.deuxcmd.require('add/cli/fixtures')
const {captchaMaker, separatorMaker} = global.deuxhelpers.require('util/cli')

class RemoveHooks extends CLI {
  constructor(options) {
    super()
    this.themeFilters = undefined
    this.themeActions = undefined
    this.init(false, options)
  }

  /**
   * Setup remove hooks prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.themeFilters = themeInfo.filters
    this.themeActions = themeInfo.actions

    if (this.themeFilters.length + this.themeActions.length === 0) {
      this.$logger.happyExit()
    }

    const getHookInfo = (items, type) => new Promise((resolve, reject) => {
      Promise.all(items.map(
        file => new Promise((resolve, reject) => {
          wpFileHeader(this.currentThemePath('includes', `${type}s`, `${file}.php`))
          .then(info => {
            resolve({
              name: info[`${type}Name`],
              value: {
                type,
                file
              }
            })
          }).catch(reject)
        })
      )).then(items => {
        resolve({
          type,
          items
        })
      }).catch(reject)
    })

    this.$title = 'Remove {Actions / Filters} Hooks'
    this.$prompts = [
      {
        type: 'checkbox',
        name: 'hooks',
        message: 'Select hooks you want to remove',
        choices: () => new Promise((resolve, reject) => {
          Promise.all([
            getHookInfo(this.themeFilters, hookTypes.FILTER),
            getHookInfo(this.themeActions, hookTypes.ACTION)
          ]).then(hooks => {
            let list = []
            let filters = []
            let actions = []

            hooks.forEach(hook => {
              switch (hook.type) {
                case hookTypes.FILTER:
                  filters = hook.items
                  break

                case hookTypes.ACTION:
                  actions = hook.items
                  break

                default: break
              }
            })

            if (filters.length > 0) {
              list = list.concat(separatorMaker('Filters').concat(filters))
            }

            if (actions.length > 0) {
              list = list.concat(separatorMaker('Actions').concat(actions))
            }

            resolve(list)
          }).catch(reject)
        })
      },

      Object.assign(captchaMaker(), {
        when: ({hooks}) => hooks.length > 0
      }),

      {
        type: 'confirm',
        name: 'confirm',
        when: ({hooks, captcha}) => hooks.length > 0 && captcha,
        default: false,
        message: () => 'Removing hooks from config can\'t be undone. Do you want to continue?'
      }
    ]
  }

  /**
   * Remove hooks file and config
   *
   * @param {Object} {hooks, confirm}
   */
  action({hooks, confirm}) {
    if (hooks.length === 0 || (!confirm && !this.$init.apiMode())) {
      this.$logger.happyExit()
    }

    Promise.all(hooks.map(
      item => new Promise(resolve => {
        rimraf.sync(this.currentThemePath('includes', `${item.type}s`, `${item.file}.php`))

        if (item.type === hookTypes.FILTER) {
          this.themeFilters = this.themeFilters.filter(_item => _item !== item.file)
        } else {
          this.themeActions = this.themeActions.filter(_item => _item !== item.file)
        }

        resolve()
      })
    )).then(() => {
      Promise.all([
        new Promise(resolve => {
          this.setThemeConfig({
            filters: uniq(this.themeFilters),
            actions: uniq(this.themeActions)
          })
          resolve()
        })
      ]).then(
        this.$logger.finish(messages.SUCCEED_REMOVED_HOOKS)
      ).catch(this.$logger.exit)
    }).catch(this.$logger.exit)
  }
}

module.exports = RemoveHooks
