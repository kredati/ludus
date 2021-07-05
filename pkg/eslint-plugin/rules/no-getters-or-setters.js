const create = (ctx) => ({
  Property (node) {
    if (node.kind === 'get') {
      ctx.report({node, message: 'Unexpected `get`'})
    }
    if (node.kind === 'set') {
      ctx.report({node, message: 'Unexpected `set`'})
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits getter or setter properties.',
      recommended: 'error'
    }
  }
}