'use strict';

const no_invalid_statements = require('../rules/no-invalid-statements.js');
const {RuleTester} = require('eslint');

const rule_tester = new RuleTester({parserOptions: { ecmaVersion: 2021 }});

rule_tester.run("no-invalid-statements", no_invalid_statements, {
  valid: [{ code: `let foo = bar; () => { return bar; };` }],
  invalid: [
    {code: `if (foo) bar;`, errors: [{message: /Unexpected `if`/i}]},
    {code: `switch (foo) { case bar: 'foo'; }`, errors: [{message: /Unexpected `switch`/i}]},
    {code: `with(foo) {}`, errors: [{message: /Unexpected `with`/i}]},
    {code: `foo: {}`, errors: [{message: /Unexpected `label`/i}]},
    //{code: `continue;`, errors: [{message: /Unexpected `continue`/i}]},
    //{code: `break;`, errors: [{message: /Unexpected `break`/i}]},
    {code: `throw err;`, errors: [{message: /Unexpected `throw`/i}]},
    {code: `try { foo; } catch (e) { bar; }`, errors: [{message: /Unexpected `try`/i}]},
    {code: `while (foo) {}`, errors: [{message: /Unexpected `while`/i}]},
    {code: `do {} while (foo)`, errors: [{message: /Unexpected `do`/i}]},
    {code: `for (let i = 0; i < foo; i++) {console.log(i)}`, errors: [{message: /Unexpected `for`/i}]},
    {code: `for (let foo in bar) {}`, errors: [{message: /Unexpected `for`/i}]},
    {code: `for (let foo of bar) {}`, errors: [{message: /Unexpected `for`/i}]},
  ]
});