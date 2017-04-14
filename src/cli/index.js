import init from './init'

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
  })
}
