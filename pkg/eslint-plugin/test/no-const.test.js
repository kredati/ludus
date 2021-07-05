const no_const = require('../rules/no-const.js');
const {RuleTester} = require('eslint');

const rule_tester = new RuleTester({parserOptions: { ecmaVersion: 2021 }});

rule_tester.run("no-const", no_const, {
  valid: [{ code: `var foo = bar;` }],
  invalid: [
    {code: `const foo = bar;`, errors: [{message: /No `const`/i}]}
  ]
});