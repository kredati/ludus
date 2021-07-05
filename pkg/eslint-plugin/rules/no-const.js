'use strict';

const create = (context) => {
  return {
    VariableDeclaration(node) {
      if (node.kind === 'const') {
        context.report({node, message: 'No `const` assignments allowed.'});
      }
    }
  }
};

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Forbid the use of `const`.',
      recommended: 'error'
    }
  }
}