const no_multi = require('../rules/no-multi-declarations.js');
const {RuleTester} = require('eslint');

let ruleTester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

ruleTester.run(
  "no-multi", 
  no_multi, {
  valid: [{code: `let foo = bar;`}],
  invalid: [
    {code: `let foo = bar, baz = quux;`, errors: [{message: /You may only bind/i}]}
  ]
})