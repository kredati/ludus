const casing = require('../rules/ensure-object-casing.js');
const {RuleTester} = require('eslint');

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'ensure-object-casing',
  casing,
  {
    valid: [
      {code: `let foo = {Bar};`},
      {code: `let foo = {bar};`},
      {code: `let foo = {Bar: Baz};`},
      {code: `let foo = {bar: baz};`},
      {code: `let foo = {bar: 42};`}
    ],
    invalid: [
      {code: `let foo = {Baz: bar}`, errors: [{message: /Only names/i}]},
      {code: `let foo = {Bar: 42}`, errors: [{message: /Only names/i}]}
    ]
  }
);