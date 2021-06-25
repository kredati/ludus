const no_empty = require('../rules/no-empty-declarations');
const {RuleTester} = require('eslint');

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'no-empty-declarations',
  no_empty,
  {
    valid: [{code: 'let foo = bar;'}],
    invalid: [
      {code: 'let foo;', errors: [{message: /Expected expression/i}]}
    ]
  }
);