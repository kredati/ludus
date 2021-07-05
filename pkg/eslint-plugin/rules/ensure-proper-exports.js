const is_capitalized = require('./is_capitalized');

const create = (ctx) => ({
  "ExportNamedDeclaration VariableDeclaration" (node) {
    ctx.report({node, message: 'Unexpected `let` statement.'});
  },
  "ExportSpecifier Identifier" (node) {
    if (is_capitalized(node.name)) {
      ctx.report({node, message: `Unexpected namespace export. Namespaces may only be exported as \`export default ns(...);\``});
    }
  },
  "ExportDefaultDeclaration" (node) {
    if (node.declaration?.callee?.name !== 'ns') {
      ctx.report({node, message: `Only namespaces may be default exports, and must be in the format \`export default ns(...);\` `});
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensures proper Ludus exports.',
      recommended: 'error'
    }
  }
};