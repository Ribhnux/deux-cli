const CLI = global.deuxcli.require('main')
const messages = global.deuxcli.require('messages')

class SyncCLI extends CLI {
  constructor(options) {
    super()
    this.options = options
    this.init(options)
  }

  /**
   * Setup title and prompts
   */
  prepare() {
    this.$title = '{Synchronize Theme Config}'
    this.$prompts = [
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
      this.$logger.finish(messages.SYNC_NEXT_TIME)
    }

    const syncLoader = this.$logger.loader('Synchronizing')
    Promise.all([
      new Promise(resolve => {
        this.sync()
        resolve()
      })
    ]).then(() => {
      syncLoader.succeed(messages.SUCCEED_SYNCRHONIZED)
    }).catch(this.$logger.exit)
  }
}

module.exports = SyncCLI
