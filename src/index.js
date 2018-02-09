// TODO support magic 'module'
// TODO support magic 'require' maybe?
// TODO either handle cyclic deps or throw if they exist

(function define(
  modules,
  pending,
  needs,
  deps,
  body,
  factory,
  window,
  exports,
  define,
  length,
  push
) {
  // support magic exports
  modules[exports] = {}

  const isEmpty = v => !v || !v[length]

  const each = (arr, fn) => {
    for (let i = 0; i++ < arr[length];) fn(arr[i - 1])
  }

  const instantiate = (id) => {
    const thisModule = modules[id]

    let thisBody
    if (isEmpty(thisModule[deps])) {
      thisBody = thisModule[factory]()
    } else {
      const args = []
      let exportsObject
      each(thisModule[deps], (d) => {
        if (d === exports) {
          exportsObject = {}
          args[push](exportsObject)
        } else {
          args[push](modules[d][body])
        }
      })
      thisBody = thisModule[factory].apply(null, args)
      if (exportsObject) thisBody = exportsObject
    }
    thisModule[body] = thisBody
    window[id] = thisBody

    const stillPending = []
    each(pending, (otherModuleId) => {
      const mod = modules[otherModuleId]
      if (mod[needs][id]) {
        delete mod[needs][id]
        mod.c -= 1
        if (mod.c === 0) {
          instantiate(otherModuleId)
        } else {
          stillPending.push(otherModuleId)
        }
      }
    })
    pending = stillPending
  }

  window[define] = (moduleId, modDeps, modFactory) => {
    if (typeof modDeps === 'function') modFactory = modDeps, modDeps = []

    const thisModule = modules[moduleId] = { id: moduleId, c: 0 }
    thisModule[factory] = modFactory
    thisModule[deps] = modDeps
    thisModule[needs] = {}

    // what, if anything does this module need?
    // each(deps, () => {})
    each(modDeps, (need) => {
      if (
        !modules[need] || // the module isnt here yet
        !isEmpty(modules[need][needs]) // the module is here but needs stuff
      ) {
        thisModule.c += 1
        thisModule[needs][need] = true
      }
    })

    if (thisModule.c < 1) {
      instantiate(moduleId)
    } else {
      pending[push](moduleId)
    }
  }
  
  window[define].amd = {}
})(
  {},
  [],
  'n',
  'd',
  'b',
  'f',
  window,
  'exports',
  'define',
  'length',
  'push'
)