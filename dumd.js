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
  push,
  apply,
  /* declarations: */
  isEmpty,
  each,
  instantiate,
) {
  // support magic exports
  modules[exports] = {}

  isEmpty = v => !v || !v[length]

  each = (arr, fn, /* declarations: */ i) => {
    for (i = 0; i++ < arr[length];) fn(arr[i - 1])
  }

  instantiate = (id, /* declarations: */ thisBody, thisModule, exportsObject, args, stillPending) => {
    thisModule = modules[id]

    if (isEmpty(thisModule[deps])) {
      thisBody = thisModule[factory]()
    } else {
      args = []
      exportsObject
      each(thisModule[deps], (d) => {
        if (d === exports) {
          exportsObject = {}
          args[push](exportsObject)
        } else {
          args[push](modules[d][body])
        }
      })
      thisBody = thisModule[factory][apply](null, args)
      if (exportsObject) thisBody = exportsObject
    }
    thisModule[body] = thisBody
    window[id] = thisBody

    stillPending = []
    each(pending, (otherModuleId, /* declarations */ mod, undef) => {
      mod = modules[otherModuleId]
      if (mod[needs][id]) {
        mod[needs][id] = undef
        mod.c -= 1
        if (mod.c === 0) {
          instantiate(otherModuleId)
        } else {
          stillPending[push](otherModuleId)
        }
      }
    })
    pending = stillPending
  }

  window[define] = (moduleId, modDeps, modFactory, /* declarations: */ thisModule) => {
    if (modDeps[apply]) modFactory = modDeps, modDeps = []

    thisModule = modules[moduleId] = { id: moduleId, c: 0 }
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
  0, // needs
  1, // deps
  2, // body
  3, // factory
  window,
  'exports',
  'define',
  'length',
  'push',
  'apply'
)
