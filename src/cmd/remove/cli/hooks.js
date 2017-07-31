const rimraf = require('rimraf')
const wpFileHeader = require('wp-get-file-header')
const uniq = require('lodash.uniq')
const {happyExit, captchaMaker, separatorMaker} = require('./util')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {hookTypes} = global.deuxcmd.require('add/cli/const')
const {exit, finish} = global.deuxhelpers.require('logger')

class RemoveHooks extends CLI {
  constructor() {
    super()
    this.themeFilters = undefined
    this.themeActions = undefined
    this.init()
  }

  /**
   * Setup remove hooks prompts
   */
  prepare() {
    const themeInfo = this.themeInfo()
    this.themeFilters = themeInfo.filters
    this.themeActions = themeInfo.actions

    if (this.themeFilters.length + this.themeActions.length === 0) {
      happyExit()
    }

    const getHookInfo = (items, type) => new Promise((resolve, reject) => {
      Promise.all(items.map(
        value => new Promise((resolve, reject) => {
          wpFileHeader(this.themePath([this.themeDetails('slug'), 'includes', `${type}s`, `${value}.php`]))
          .then(info => {
            resolve({
              name: info[`${type}Name`],
              value: {
                type,
                value
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

    this.title = 'Remove {Actions / Filters} Hooks'
    this.prompts = [
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
    if (hooks.length === 0 || !confirm) {
      happyExit()
    }

    Promise.all(hooks.map(
      item => new Promise(resolve => {
        const themeDetails = this.themeDetails()

        rimraf.sync(this.themePath([themeDetails.slug, 'includes', `${item.type}s`, `${item.value}.php`]))
        if (item.type === hookTypes.FILTER) {
          this.themeFilters = this.themeFilters.filter(_item => _item !== item.value)
        } else {
          this.themeActions = this.themeActions.filter(_item => _item !== item.value)
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
        finish(messages.SUCCEED_REMOVED_HOOKS)
      ).catch(exit)
    }).catch(exit)
  }
}

module.exports = RemoveHooks
