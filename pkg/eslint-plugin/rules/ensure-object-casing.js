const is_capitalized = require('./is_capitalized');

const create = (ctx) => ({
  "ObjectExpression Property" (node) {
    if (is_capitalized(node.key.name)) {
      if (node.value.type !== 'Identifier' || !is_capitalized(node.value.name)) {
        ctx.report({node, message: 'Only names of namespaces may be capitalized.'});
      }
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Prohibits storing capitalized variables at lowercase keys in objects.',
      recommended: 'error'
    }
  }
}