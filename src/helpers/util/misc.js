exports.isJSON = str => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return false
  }
}

exports.capitalize = str => str.split(' ').map(
  item => item.charAt(0).toUpperCase() + item.split('').slice(1, item.length).join('')
).join(' ')

exports.isJSON = str => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return false
  }
}

exports.getGitAuth = (gitUrl) => {
  const giturl = require('url').parse(gitUrl)
  const gitauth = giturl.auth ? giturl.auth.split(':') : ''

  return {
    username: gitauth[0],
    password: gitauth[1]
  }
}
