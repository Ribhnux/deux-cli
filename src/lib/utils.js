export const isJSON = str => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return false
  }
}

export default {}
