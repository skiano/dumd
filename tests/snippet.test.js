const test = require('tape')

test('snippet build', (t) => {
  t.plan(1)

  t.doesNotThrow(() => {
    const dumd = require('../')
    eval(dumd)
  })
})
