const is_capitalized = require('./is_capitalized');

const create = (ctx) => ({
  MemberExpression (node) {
    if (node.computed) {
      ctx.report({node, message: 'Unexpected `[`'});
    }
    if (!is_capitalized(node.object.name)) {
      ctx.report({node, message: 'Unexpected dot, `.`: the dot operator may only be used with namespaces.'});
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensures proper dot-access--only for namespaces.',
      recommended: 'error'
    }
  }
};