# Some thoughts about Ludus style

### In Ludus
* Variables should use `snake_case` throughout.
* Namespaces should be named with captitals, and their identifiers must be capitalized: `export default ns({name: 'Foo'})`.
* Types' names should capitlized, and their identifiers should end with the suffix `_t`, e.g. `let foo_t = deftype({name: 'Foo'});`.
* Types and namespaces should be shortened to their logical briefest, e.g. `List`, `Bool`, `Str`.
* Predicate functions should always begin with `is_`: `is_num`, `is_int`, etc. The exception to this is `has`.
* Functions that create types should be the lowercased version of their namespace: `Arr.arr(1, 2, 3); //=> [1, 2, 3]`.
    - When do we use `def` as prefix? `defn`, `deftype`, `defspec`, but `ns`, `arr`, `list`, etc.
    - This suggests `spec`, `type`, and `fn`... which makes sense?
* Instead of writing concrete specs for types, prefer to use predicate functions that can be used in specs.
* Where reasonable, functions should be variadic, with fewer arguments returning partially applied versions of functions, e.g. `add(1); //=> add<partial(1)>`, a function that adds 1 to its argument; `add(1, 2); //=> 3`.
* Functions should have `pre` specs wherever it's appropriate (no need for `pre: args([any])`).
* Prefer function specs that are explicit: `args([is_num], [is_num, is_num])` instead of `seq(num)`. However, with more than three arities, use `seq`.
* If a file exports a namespace, avoid also exporting named elements.
    - Can this be enforced? Only one export statement in a file?
* All imports should go at the top of files; all exports at the bottom of files.
* Imports' local identifiers should be the same as their namespace names, e.g. `import Pred from 'preds.js';`.
* File names should coincide with namespace names. (We must rename `preds.js` to `pred.js`.)
* All elaboration of local identifiers from namespaces should come after imports and before any local definitions.
* Prefer destructuring assignment for local identifiers.
* Functions should always have explicit returns, even if mutating functions `return undefined`.
* Functions that have stateful effects should never return anything other than `undefined`. In other words, if a function gives a return value, it must not also have side effects.

### In JS
* Unless it's impossible or for optimization purposes, all JS should stay as close to Ludus as possible.
* As for optimization, use loops and mutation locally when it offers plausible speed improvement, especially if functions have or are likely to be used in tight loops.
* However, if it is possible to use fast abstractions over collections (e.g., `Seq`s), use those instead of eager optimization.
* Too ensure `export default ns(...);` at the end of each file (to match Ludus language requirements), always use `let {ns} = NS;` at the top.
* Use Ludus functions where reasonable.
* Use the highest-level looping constructs possible: `for..of` for iterables; `for..in` for objects.
* Use ternary expressions for conditionals whenever appropriate; do not nest them, however (even if in Ludus, you might use nested `when`s). If you must use `if` for multiple branching, make the conditional action as simple as possible, preferring single `return` statements.
* In block-based JS constructs (`if`, `for` loops, etc.) where they are optional, always use curly braces. Do not put semicolons after such blocks.
* Use semicolons at the ends of statements. Do not rely on ASI, however much better it looks.