let create = (ctx) => ({
  FunctionDeclaration(node) {
    ctx.report({node, message: 'Unexpected reserved word `function`.'})
  },
  FunctionExpression(node) {
    ctx.report({node, message: 'Arrow function expected.'})
  },
  ArrowFunctionExpression(node) {
    if (node.async) {
      ctx.report({node, message: 'Unexpected reserved word `async`.'})
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Only allows arrow functions.',
      recommended: 'error'
    } 
  }
}