import init from './init'
import * as message from '../lib/messages'
import { error } from '../lib/logger'
import program from 'commander'

export default options => {
  return new Promise(resolve => {
    init(options)
      .then(() => {
        const addNew = require('./commands/new')
        const dev = require('./commands/dev')
        const add = require('./commands/add')

        resolve({
          new: addNew,
          dev,
          add
        })
      })
      .catch(err => {
        if (err) {
          console.log('')
          error({ err })
          console.log('')
        }
        process.exit(0)
      })
  })
}
