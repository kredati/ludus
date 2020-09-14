# On interfaces

So... I'm still throughly unsure how to model polymorphism in Ludus. It's easy enough to say "use multimethods!" But multimethods in Ludus still need a function to switch on. And the most obvious version of this is something like `type`. But that's punted on an understanding of type: I don't have a robust function called `type_of` (I have only a weak-sauce prototype of one).

I've been reading about Clojure's system of handling this and... it's complicated. I'm sure I don't understand it yet, but one of the things I *can* say for now is that it's got a clojurish system bolted onto Java. Ludus will (I am insistent on this) have a single type system, and won't have the Rube Goldberg machine that is Clj's type system.

For more, see: https://aphyr.com/posts/352-clojure-from-the-ground-up-polymorphism. (Of course, Aphyr to the rescue.)

## Desiderata
What do we want out of a type system for Ludus:
* That it be as intuitive as possible, modulo some definition of intuitive. (We will have to provide some level of intuition here).
* That it be polymorphic as possibe. Meaning: a single type can implement many interfaces. Refer to the table in [my notes on colls](./colls.md). Collections implement a great many small interfaces, and being able to resolve them easily and quickly (from a user point of view, and secondarily from a computational point of view) is important.
* That it be as closely integrated into Ludus abstractions as possible. In particular, the idea is not to have stuff play nice with Javascript's various polymorphisms, but rather, everything should start and finish with Ludus's abstractions. Clojure is a sophisticated langauge for people who already understand programming; it can afford its complex abstractions over Java's type system. Ludus cannot.
* That it be reasonably fast. Emphasis on reasonably.

## What we don't want
* Clojure leaks the Java/script abstractions around construction and methods. Ultimately, in Ludus, we want to avoid leaking wherever possible.
* That means no dot-methods, nor special dot-constructors. Everything has to be plain functions or multimethods wherever possible. (And I believe it should be basically possible everywhere.)
* Nothing stateful. No mixing of methods and records, basically.

## What we do (maybe) want
* The more I think about this, the more I think that a module system à la OCaml is the right thing to do. (Not parametric modules!——Although that's perhaps interesting later on.)
* The idea is that particular datatypes are attached to namepsaces, and the function namepsace is basically applied to the data constructor. That means that `arr.conj` dispatches to `conj` in the `Arr` namespace. `Arr.conj` actually does not invoke `this`: these are static methods. But the prototype-based dispatch seems worthy.
* This particular scheme needs some nice ergonmics around defining modules and datatypes, but those ergonimcs are really TBD. The primary thing is to be able to dispatch per-method. `dissoc` is not defined for `Arr` is just fine; we don't need `Arr does not implement IFoo...`.
* The thing to do is to write or rewrite methods as functions that take the datatype as the first argument. To be sure, I think it cannot be the case that all module functions take the datatype as the first argument, although it strikes me as a plausible idea. Rewrite `list`, then `obj` in this style, and see what happens.
* This may also be the argument for a `meta` object that does the dynamic dispatch. The idea is that we want to be able to call `conj` on `Arr` vs `List`. (How do we do this if not on the first argument?--maybe that's the convention, very Python, actually.) `Meta.conj(foo, 1)`. 