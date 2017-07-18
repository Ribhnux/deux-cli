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
