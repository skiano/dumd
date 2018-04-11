const dlv = require('dlv')
const recast = require("recast")
const types = recast.types
const b = types.builders

const defineModuleIds = (umd, ids) => {
  ids = Array.isArray(ids) ? ids.reverse() : [ids]
  const ast = recast.parse(umd)

  const addIdToArgs = (args, n) => {
    const modId = ids.pop()
    if (!modId) throw new Error(`ran out of ids for:\n\n${recast.print(n).code}\n`)

    const modIdArg = b.literal(modId)

    if (
      args[0] &&
      args[0].type === 'Literal' &&
      typeof args[0].value === 'string'
    ) {
      // replace whatever id is there with ours
      args[0] = modIdArg
    } else {
      args.unshift(modIdArg)
    }

    return true
  }

  const fixIfConstruction = (n) => {
    if (dlv(n, 'test.right.property.name') !== 'amd') return

    const consequent = dlv(n, 'consequent')
    if (!consequent) return

    const exp = consequent.body
      ? consequent.body[0] && consequent.body[0].expression
      : consequent.expression

    if (!exp) return
    if (dlv(exp, 'callee.name') !== 'define') return

    // looks like a define... add the module id
    addIdToArgs(dlv(exp, 'arguments'), n)

    return true
  }

  const fixTernary = (n) => {
    const isDefineCheck = (
      dlv(n, 'test.right.object.name') === 'define' &&
      dlv(n, 'test.right.property.name') === 'amd' &&
      dlv(n, 'consequent.callee.name') === 'define'
    )
    if (!isDefineCheck) return

    // looks like a define... add the module id
    addIdToArgs(dlv(n, 'consequent.arguments'), n)

    return true
  }

  // search for all umd bundles
  recast.visit(ast, {
    visitConditionalExpression: function(path) {
      if (fixTernary(path.node)) return false
      this.traverse(path);
    },
    visitIfStatement(path) {
      if (fixIfConstruction(path.node)) return false
      this.traverse(path);
    }
  })

  if (ids.length) {
    throw new Error(`unused ids: ${ids.join(' ')}`)
  }

  return recast.print(ast).code
}

module.exports = defineModuleIds
