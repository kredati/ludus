const create = (ctx) => ({
  YieldExpression(node) {
    ctx.report({node, message: 'Unexpected reserved word `yield`.'})
  },
  TaggedTemplateExpression(node) {
    ctx.report({node, message: 'Unexpected backtick: `.'})
  },
  ThisExpression(node) {
    ctx.report({node, message: 'Unexpected reserved word `this`.'})
  },
  NewExpression(node) {
    ctx.report({node, message: 'Unexpected reserved word `new`.'})
  },
  AwaitExpression(node) {
    ctx.report({node, message: 'Unexpected reserved word `await`.'})
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits invalid expression types in Ludus.',
      recommended: 'error'
    }
  }
}