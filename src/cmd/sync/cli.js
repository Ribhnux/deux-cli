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
    Promise.all([
      new Promise(resolve => {
        this.sync()
        resolve()
      })
    ]).then(() => {
      syncLoader.succeed(messages.SUCCEED_SYNCRHONIZED)
      blank()
    }).catch(exit)
  }
}

module.exports = SyncCLI
