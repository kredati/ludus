const is_capitalized = require('./is_capitalized');

const create = (ctx) => ({
  VariableDeclarator (node) {
    if (node.id.type === 'Identifier' && is_capitalized(node.id.name)) {
      ctx.report({node, message: `Bad name: \`${node.id.name}\`. Only the names of namespaces may begin with a capital letter.`});
    } 
  },
  "ObjectPattern Identifier" (node) {
    if (is_capitalized(node.name)) {
      ctx.report({node, message: `Bad name: \`${node.name}\`. Only the names of namespaces may begin with a capital letter.`})
    }
  },
  "ArrayPattern Identifier" (node) {
    if (is_capitalized(node.name)) {
      ctx.report({node, message: `Bad name: \`${node.name}\`. Only the names of namespaces may begin with a capital letter.`})      
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensures lower-casing of normal variable bindings.',
      recommended: 'error'
    }
  }
};