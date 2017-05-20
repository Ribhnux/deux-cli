import init from './init'

export default skip => {
  return new Promise(resolve => {
    init(skip).then(db => {
      resolve({
        db,
        $new: require('./commands/new'),
        $switch: require('./commands/switch'),
        $status: require('./commands/status'),
        $add: require('./commands/add')
        // E dev: require('./commands/dev'),
        // list: require('./commands/list')
      })
    }).catch(err => {
      console.log(err.message())
    })
  })
}
