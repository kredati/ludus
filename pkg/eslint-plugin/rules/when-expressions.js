const create = (ctx) => ({
  ConditionalExpression (node) {
    if (node.test.callee?.name !== 'when') {
      ctx.report({node, message: 'Conditional expressions must start with a call to `when`.'})
    }
    if (node.test.arguments?.length !== 1) {
      ctx.report({node, message: `Wrong number of arguments to \`when\`: expected 1 but received ${node.test.arguments.length}.`})
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Requires conditional expressions to start with `when`.',
      recommended: 'error'
    }
  }
};