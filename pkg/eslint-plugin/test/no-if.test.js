const no_if = require('../rules/no-if.js');
const {RuleTester} = require('eslint');

const rule_tester = new RuleTester({parserOptions: { ecmaVersion: 2021 }});

rule_tester.run("no-if", no_if, {
  valid: [{ code: `foo ? bar : baz;` }],
  invalid: [
    {code: `if (foo) bar;`, errors: [{message: /No `if`/i }]}
  ]
});