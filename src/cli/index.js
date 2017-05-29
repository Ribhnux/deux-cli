import init from './init'

export default skip => new Promise(resolve => {
  init(skip).then(db => {
    resolve({
      $new: require('./new-cmd'),
      $switch: require('./switch-cmd'),
      $status: require('./status-cmd'),
      $add: require('./add-cmd'),
      db
    })
  }).catch(err => {
    throw err
  })
})
