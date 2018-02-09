const { resolve } = require('path')
const dumdPath = resolve(__dirname, '../dumd.js')

const bootstrap = () => {
  global.window = {}
  delete require.cache[dumdPath]
  require(dumdPath)
}

bootstrap()

const moduleFacoryA = (b, c) => {
  console.log(b, c)
}

const moduleFacoryB = (c) => {
  return {
    id: 'b',
    uses: c
  }
}

const moduleFacoryC = () => {
  return {
    id: 'c',
  }
}

window.define('a', ['b', 'c'], moduleFacoryA)
window.define('b', ['c'], moduleFacoryB)
window.define('c', moduleFacoryC)
