const no_caps = require('../rules/no-capitalized-variables');
const {RuleTester} = require('eslint');

const tester = new RuleTester({parserOptions: {ecmaVersion: 2021}});

tester.run(
  'no-capitalized-variables',
  no_caps,
  {
    valid: [
      {code: 'let foo = bar;'},
      {code: 'let {foo, bar} = Baz;'},
      {code: 'let [foo, bar] = Baz;'}
    ],
    invalid: [
      {code: 'let Foo = bar;', errors: [{message: /Bad name/i}]},
      {code: 'let {Foo, bar} = bar;', errors: [{message: /Bad name/i}, {message: /Bad name/i}]},
      {code: 'let [Foo] = bar;', errors: [{message: /Bad name/i}]},
      {code: 'let [_, ...Foo] = bar;', errors: [{message: /Bad name/i}]},
      {code: 'let {foo, ...Foo} = bar;', errors: [{message: /Bad name/i}]}
    ]
  }
);