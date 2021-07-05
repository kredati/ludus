const create = (ctx) => ({
  VariableDeclarator(node) {
    let {init} = node;
    if (init == null) {
      ctx.report({node, message: 'Expected expression.'})
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Requires variable declarations to also include definitions.',
      recommended: 'error'
    }
  }
};