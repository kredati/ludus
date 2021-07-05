'use strict';

const report = (ctx) => (token) => (node) => {
  ctx.report({node, message: `Unexpected \`${token}\``});
};

const create = (context) => {
  let rpt = report(context);
  return {
    IfStatement(node) {
      context.report({node, message: 'Unexpected `if`.'});
    },
    SwitchStatement: rpt('switch'),
    WithStatement: rpt('with'),
    LabeledStatement: rpt('label'),
    BreakStatement: rpt('break'),
    ContinueStatement: rpt('continue'),
    ThrowStatement: rpt('throw'),
    TryStatement: rpt('try'),
    WhileStatement: rpt('while'),
    DoWhileStatement: rpt('do'),
    ForStatement: rpt('for'),
    ForInStatement: rpt('for'),
    ForOfStatement: rpt('for')
  }
};

module.exports = {
  create,
  meta: {
    docs: {
      description: 'Ensure valid Ludus statements only.',
      recommend: 'error'
    }
  }
};