# On using ESLint to parse Ludus

### A subset of JS
Since Ludus is a stlib + subset of JS, it seems to me that we can get a lot of the way to parsing Ludus by creating a set of ESLint rules. ESLint looks like it's a bit titchy, but it's also nearly universal. VSCode uses it out of the box. And it's easy enough to turn off ESLint per-line or per-file as escape hatches.

What rules might we need (WIP):
* No `const` or `var`.
* No bare assignment (reassignment).
* No operators.
  - Except dot-properties on namespaces.
  - This includes bracket property access.
* Rules around identifiers (TBD):
  - In `let` statements, only use lowercase identifiers on the LHS.
  - In `import` statements, only use uppercase for `import Foo from 'bar';` statements.
* Only arrow functions.
  - No method-style properties on objects.
* No accessing JS builtin globals.
* Allow access to Ludus prelude globals.
* Require `import 'ludus';` at the beginning of every file.
* Exports must either be `export default ns` or `export {foo}`.
* No ternaries *except* after a call to `when`; ternaries *must* follow a call to `when`.
* Require semicolons (but this can be fixable!).
* Prohibited keywords:
  -`new`
  -`this`
  -`class`
  -`null`
  -`if`
  -`else`
  -`switch`
  -`case`
  -`for`
  -`while`
  -`in`
  -`function`

Some of these are in normal ESLint rules; some of these I can yank from others' extensions/plugins.
