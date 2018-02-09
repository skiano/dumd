window.define = (function define(modules, pending) {
  const each = (arr, fn) => {
    for (let i = 0; i < arr.length; i++) {
      fn(arr[i], i)
    }
  }

  const instantiate = (id) => {
    const thisModule = modules[id]

    let body
    if (!thisModule.deps.length) {
      body = thisModule.factory()
    } else {
      const args = []
      let exportsObject
      each(thisModule.deps, (d) => {
        if (d === 'exports') {
          exportsObject = {}
          args.push(exportsObject)
        } else {
          args.push(modules[d].body)
        }
      })
      body = thisModule.factory.apply(null, args)
      if (exportsObject) body = exportsObject
    }
    thisModule.body = body
    window[id] = thisModule.body

    each(pending, (otherModuleId) => {
      const mod = modules[otherModuleId]
      if (mod.needs[id]) {
        delete mod.needs[id]
        mod.c -= 1
        if (mod.c === 0) {
          pending.splice(pending.indexOf(otherModuleId))
          instantiate(modId)
        }
      }
    })
  }

  return (moduleId, deps, factory) => {
    console.log(moduleId, deps, factory)
    
    if (typeof deps === 'function') factory = deps, deps = []

    const thisModule = modules[moduleId] = { id: moduleId, c: 0, needs: {}, factory, deps }

    // what, if anything does this module need?
    // each(deps, () => {})
    each(deps, (need) => {
      if (
        !modules[need] || // the module isnt here yet
        (modules[need].needs && modules[need].needs.length) // the module is here but needs stuff
      ) {
        thisModule.c += 1
        thisModule.needs[need] = true
      }
    })

    const isReady = !thisModule.needs.length

    if (!thisModule.needs.length) {
      instantiate(moduleId)
    } else {
      pending.push(moduleId)
    }
  }
})({
  exports: {
    body: {},
  },
}, [])

window.define.amd = {}