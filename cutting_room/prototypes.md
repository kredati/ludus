# On types and prototypes

One of the issues I keep running into, which feels like an unsolved design problem, is where I keep running into prototypes. I'm beginning to think that playing with prototypes, rather than against them, is going to be necessary.

In short, the idea that `add`, as a multimethod, works on numbers as well as vectors (and not needing to explicitly use `Vector.add` vs `Math.add`) suggests that a vector needs to keep track of what it is. The built-in JS ways of doing this is either to rely on a prototype or a constructor. But the issue is that the functions that work on objects-in-general will strip the prototype and constructor information: using splats, `assign`, etc., will only copy enumerable own properties, and using `for...in` loops will copy enumerable properties on both the object and the prototype--unless the prototype keeps a reference to itself, nothing will come through on copy.

## On namespaces
Some objects may want to be tightly bound to their namespaces. The idea, perhaps, is that objects keep a reference to the a namespace of functions, and that we can dispatch based on that metadata. That way, a `vector` doesn't just have an `x` and a `y` value, but a `ludus/ns` value, that points to the `Vector` namespace. And, by munging prototypes just a bit (adding `ludus/ns` properties on the builtin prototypes), we can dispatch to `Math` module stored in `Number.prototype`. And for anything that's more strongly typed, we can directly include a `ludus/ns` property supersedes the `ludus/ns` property on `Object.prototype`.

## Baggage
At the same time, lugging around this metadata really messes up the simplicity and purity of the type system here. Remember, Ludus has the following "types":
* undefined
* Boolean
* Number
* String
* Object
* Sequence

It should not be possible to create more types. Or, rather, it should be, but we don't call them types, they're something else, something smaller: predicate functions. They describe a particular shape of a type. So a vector isn't something that's created by `Vector.create` or whatever, but rather an object that has a number at `x` and `y`. If it also has a `foo` or a `bar` field, we don't care: we just pass them along. This means that it's up to the user to know what/where the functions are. (Topic: Row polymorphism. Ugh.)

### Getting a little specific
Multimethods can still exist! No worries there. But, for example, `add` probably shouldn't be a multimethod. Well, `add` could be, but it gets dicey when you want to get consistent: `add` adds two numbers, or vectors, dispatching to `Math.add` when the first argument is a number (which we'll need for partial application: we can only dispatch on the first argument). The natural signature for scaling vectors would be `mult(3, {x: 1, y: 1})`, but that doesn't work (since we'd be dispatching to `Math`, not `Vector`). So instead it's `(vector, number) -> vector`. Which breaks threading and pipelines. (Significant data last!) It also breaks a more subtle expectation: multiplication of numbers and vectors don't follow the same rules. And so, it actually doesn't make nearly as much sense as it may at first seem to try to pull out the common abstractions. Fight the impulse to abstract too early!

## Ludus vs. JS
This actually isn't very helpful at all for how I think about writing the Javascript behind Ludus: I believe this line of thinking was actually about how I ought to refactor the immutable arrays so that we're not relying on prototypes. But actually, for that, I believe I do need to use prototypes! So use prototypes I shall for that. Meaning: as it turns out, JS and Ludus don't really have cognate type systems, and I shouldn't actually try to write JS as Ludus (and vice versa).

