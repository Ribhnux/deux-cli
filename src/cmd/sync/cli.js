const path = require('path')
const {existsSync} = require('fs')
const execa = require('execa')

const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')
const {loader, finish, exit, blank} = global.deuxhelpers.require('logger')

class SyncCLI extends CLI {
  constructor() {
    super()
    this.init()
  }

  /**
   * Setup title and prompts
   */
  prepare() {
    this.title = '{Synchronize Theme Config}'
    this.prompts = [
      {
        type: 'confirm',
        name: 'confirm',
        default: false,
        message: 'Are you sure?'
      }
    ]
  }

  /**
   * Synchronizing theme config to database
   *
   * @param {Object} {confirm}
   */
  action({confirm}) {
    if (!confirm) {
      finish(messages.SYNC_NEXT_TIME)
    }

    const syncLoader = loader('Hello world')
    const themeDetails = this.themeDetails()
    const themeSlug = themeDetails.slug
    const configPath = this.themePath([themeSlug, `${themeSlug}-config.php`])
    const configName = `${themeDetails.slugfn}_config`

    const synchronize = () => new Promise((resolve, reject) => {
      if (!existsSync(configPath)) {
        blank()
        reject(messages.ERROR_CONFIG_NOT_EXISTS)
      }

      execa.stdout('php', [path.join(__dirname, 'to-json.php'), configName, configPath]).then(result => {
        resolve(JSON.parse(result))
      }).catch(exit)
    })

    synchronize().then(json => {
      this.setThemeConfig(json, true)
      syncLoader.succeed(messages.SUCCEED_SYNCRHONIZED)
      blank()
    }).catch(exit)
  }
}

module.exports = SyncCLI
