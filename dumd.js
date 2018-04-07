// TODO support magic 'module'
// TODO support magic 'require' maybe?
// TODO either handle cyclic deps or throw if they exist

// n = needs
// d = deps
// b = body
// f = factory

(function define(
  modules,
  pending,
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
  thisBody,
  thisModule,
) {
  // support magic exports
  modules[exports] = {}

  isEmpty = v => !v || !v[length]

  each = (arr, fn, /* declarations: */ i) => {
    for (i = 0; i++ < arr[length];) fn(arr[i - 1])
  }

  instantiate = (id, /* declarations: */ exportsObject, args, stillPending) => {
    thisModule = modules[id]

    if (isEmpty(thisModule.d)) {
      thisBody = thisModule.f()
    } else {
      args = []
      exportsObject
      each(thisModule.d, (d) => {
        if (d == exports) { // forgo tripple equal
          exportsObject = {}
          args[push](exportsObject)
        } else {
          args[push](modules[d].b)
        }
      })
      thisBody = thisModule.f[apply](null, args)
      if (exportsObject) thisBody = exportsObject
    }
    thisModule.b = thisBody
    window[id] = thisBody

    stillPending = []
    each(pending, (otherModuleId, /* declarations */ mod, undef) => {
      mod = modules[otherModuleId]
      if (mod.n[id]) {
        mod.n[id] = undef
        mod.c -= 1
        if (mod.c == 0) { // forgo tripple equal
          instantiate(otherModuleId)
        } else {
          stillPending[push](otherModuleId)
        }
      }
    })
    pending = stillPending
  }

  window[define] = (moduleId, modDeps, modFactory) => {
    if (modDeps[apply]) modFactory = modDeps, modDeps = []

    thisModule = modules[moduleId] = { id: moduleId, c: 0 }
    thisModule.f = modFactory
    thisModule.d = modDeps
    thisModule.n = {}

    // what, if anything does this module need?
    // each(deps, () => {})
    each(modDeps, (need) => {
      if (
        !modules[need] || // the module isnt here yet
        !isEmpty(modules[need].n) // the module is here but needs stuff
      ) {
        thisModule.c += 1
        thisModule.n[need] = true
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
  window,
  'exports',
  'define',
  'length',
  'push',
  'apply'
)
