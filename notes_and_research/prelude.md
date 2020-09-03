# Ludus `prelude`

## What all is in `prelude`
`prelude` includes all the modules required to bootstrap the Ludus environment. This means:
* Anything that relies on JS features that are not valid Ludus:
  - dot-property access (for anything that is not a namespace)
  - infix operators--of all kinds!--including `===`
  - `function` expressions (including generators, i.e. `function*`)
  - oo cruft: `class`, `this`, `new`, methods in object literals, etc.
  - loops (which are in most cases not required for semantics but could be for optimization)
  - reassignment, or any assignment outside of a `let` binding

## Two stages: signed and unsigned
`prelude` has two stages: signed and unsigned modules. Signed modules have their arguments checked, producing hopefully informative error messages. Unsigned modules are what we need to get ourselves to signing, which is also to say, to the three fundamental signing functions, `defn`, `defmulti`, and `defmethod`. The two-stage approach prevents circular dependencies.

### Unsigned modules
What we need to get to signing is: 
* an environment (`env`); 
* basic error handling (`errors`); 
* predicates (`pred`); 
* a hash map (`hash`), which is necessary for multimethods to work;
* functions (incl. multimethods) (`fns`); 
  - We put these together because explaining failures in `pre` and `post` hooks need to be hard-coded into the `pre_post` function, but also extensible by `spec`.
  - There are other ways of handling this, but they all leave something to be desired.
* and, spec (`spec`).

### Signed modules
Signed modules are the above, re-exported with signing in proper namespaces, as well as the modules not necessary for bootstrapping signing:
* equality functions (`eq`);
* linked lists (`list`);
* immutable arrays (`array`);
  - We're going with that naming for now to try to abstract away the difference between mutable and immutable data structures, and also to keep "vector" to name the mathematical thing.
* state (`refs`);
* types (`types`);
* all the functions for working with values (replacing infix operations, including dot-property access) (`vaues`);
* `reduce` and transducers (`ducers`);
* and, conditions (`cond`).

### Tada: 🎉
With that, we can export the `prelude` namespace. And then it's time for `core` to take over: a standard library that is written in Ludus.