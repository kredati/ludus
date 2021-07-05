'use strict';

let only_arrows = require('../rules/only-arrow-functions.js');
let {RuleTester} = require('eslint');

let tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'only-arrow-functions',
  only_arrows,
  {
    valid: [
      {code: `let foo = () => bar;`},
      {code: `let foo = () => { return bar; }`}
    ],
    invalid: [
      {code: `function foo() { return bar; }`,
        errors: [{message: /Unexpected reserved word/i}]},
      {code: `let foo = function() { return bar; }`,
        errors: [{message: /Unexpected reserved word/i}]}
    ]
  }
);