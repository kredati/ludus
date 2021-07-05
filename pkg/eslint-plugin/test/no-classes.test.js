const no_class = require('../rules/no-classes.js');
const {RuleTester} = require('eslint');

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'no-classes',
  no_class,
  {
    valid: [],
    invalid: [
      {code: `class Foo {}`, errors: [{message: /Unexpected reserved/i}]}
    ]
  }
);