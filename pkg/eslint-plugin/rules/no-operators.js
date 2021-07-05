const create = (ctx) => ({
  BinaryExpression(node) {
    ctx.report({node, message: `Unexpected token ${node.operator}`});
  },
  AssignmentExpression(node) {
    if (node.operator === '=') {
      ctx.report({node, message: 'Bindings may not be reassigned.'});
    } else {
      ctx.report({node, message: `Unexpected token ${node.operator}`});
    }
  },
  LogicalExpression(node) {
    ctx.report({node, message: `Unexpected token ${node.operator}`});
  },
  UnaryExpression(node) {
    if (node.operator !== '-') {
      ctx.report({node, message: `Unexpected token ${node.operator}`});
    }
  },
  UpdateExpression(node) {
    ctx.report({node, message: `Unexpected token ${node.operator}`});
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Disallows the use of operators.',
      recommended: 'error'
    }
  }
}