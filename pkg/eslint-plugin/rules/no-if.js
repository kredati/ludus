'use strict';

const create = (context) => {
  return {
    IfStatement(node) {
      context.report({node, message: 'No `if` statements allowed.'});
    }
  };
};

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Forbid the use of `if`.',
      recommended: 'error',
    }
  }
};