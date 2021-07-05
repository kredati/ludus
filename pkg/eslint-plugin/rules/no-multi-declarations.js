'use strict';

const create = (ctx) => ({
  VariableDeclaration(node) {
    let {declarations} = node;
    if (declarations.length != 1) {
      ctx.report({node, message: 'You may only bind one variable in a `let` statement.'});
    }
  }
});

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Allow only a single binding per `let` statement',
      recommended: 'error'
    }
  }
};