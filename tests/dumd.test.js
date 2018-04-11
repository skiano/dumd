const test = require('tape')
const { resolve } = require('path')
const dumdPath = resolve(__dirname, '../dumd.js')

const bootstrap = () => {
  global.window = {}
  delete require.cache[dumdPath]
  require(dumdPath)
}

const moduleFacoryA = (b, c) => {
  return {
    id: 'a',
    uses: [b, c],
  }
}

// uses magic 'exports module'
const moduleFacoryB = (exports, c) => {
  exports.id = 'b'
  exports.uses = c
}

const moduleFacoryC = () => {
  return {
    id: 'c',
  }
}

test('module loading supports standard define and exports', function (t) {
  t.plan(3);

  bootstrap()
  window.define('b', ['exports', 'c'], moduleFacoryB)
  window.define('a', ['b', 'c'], moduleFacoryA)
  window.define('c', moduleFacoryC)

  t.deepEqual(window.a, {
    id: 'a',
    uses: [
      { id: 'b', uses: { id: 'c' } },
      { id: 'c' }
    ]
  }, 'instantiates out of order')

  bootstrap()
  window.define('c', moduleFacoryC)
  window.define('b', ['exports', 'c'], moduleFacoryB)
  window.define('a', ['b', 'c'], moduleFacoryA)

  t.deepEqual(window.a, {
    id: 'a',
    uses: [
      { id: 'b', uses: { id: 'c' } },
      { id: 'c' }
    ]
  }, 'instantiates in order')

  bootstrap()
  window.define('c', moduleFacoryC)
  window.define('a', ['b', 'c'], moduleFacoryA)

  t.notOk(window.a, 'doesnt instantiate early')
});
