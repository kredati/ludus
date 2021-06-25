const is_capitalized = require('./is_capitalized');

const create = (ctx) => ({
  "ImportSpecifier Identifier" (node) {
    if (is_capitalized(node.name)) {
      ctx.report({node, message: `Bad name \`${node.name}\. Only names of namespaces may be capitalized.`});
    }
  },
  "ImportDefaultSpecifier Identifier" (node) {
    if (!is_capitalized(node.name)) {
      ctx.report({node, message: `Bad name \`${node.name}.\` Names of namespaces must be capitalized.`});
    }
  },
  ImportNamespaceSpecifier (node) {
    ctx.report({node, message: 'Unexpected *.'});
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensures propper import syntax for Ludus.',
      recommend: 'error'
    }
  }
}