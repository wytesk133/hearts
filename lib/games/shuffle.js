let crypto = require('crypto');

module.exports = (arr) => {
  for (let i = 0; i <= arr.length - 2; ++i) {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Potential_sources_of_bias
    let j = crypto.randomInt(i, arr.length)
    let tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
}
