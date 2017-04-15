import init from './init'

export default options => {
  return new Promise(resolve => {
    init(options).then(() => {
      resolve({
        new: require('./commands/new'),
        dev: require('./commands/dev'),
        add: require('./commands/add'),
        status: require('./commands/status'),
        switch: require('./commands/switch')
      })
    })
  })
}
