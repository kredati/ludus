const no_shadowing_specials = require('../rules/no-shadowing-specials')
const {RuleTester} = require('eslint')

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}})

tester.run(
  "no-shadowing-specials",
  no_shadowing_specials,
  {
    valid: [
      {code: `let foo = when`},
      {code: `let foo = ns`},
      {code: 'when(foo) ? bar : baz'}
    ],
    invalid: [
      {code: `let when = 42`, errors: [{message: /Cannot redefine special form/i}]},
      {code: 'let {when} = foo', errors: [{message: /Cannot redefine special form/i}]},
      {code: `let [ns] = n`, errors: [{message: /Cannot redefine special form/i}]}
    ]
  }
)