const no_ops = require('../rules/no-operators.js');
const {RuleTester} = require('eslint');

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'no-operators',
  no_ops,
  {
    valid: [{code: '-42;'}],
    invalid: [
      {code: `foo || bar`, errors: [{message: /Unexpected token/i}]},
      {code: `12 + 'foo'`, errors: [{message: /Unexpected token/i}]},
      {code: `foo = 42`, errors: [{message: /Bindings may not/i}]},
      {code: `i++`, errors: [{message: /Unexpected token/i}]},
      {code: `++i`, errors: [{message: /Unexpected token/i}]},
      {code: `i += 1`, errors: [{message: /Unexpected token/i}]}
    ]
  }
);