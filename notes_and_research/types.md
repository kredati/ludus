# Some more deep thoughts on types

## Currently
Ludus has an incredibly simple type system: you get a "ludus/type" tag that holds a Record (of the value-identical kind I pulled down from the proposal for Records and Tuples). You can switch on type in a multimethod by simply extracting the value of "ludus/type."

Also, a type accepts an arbitrary predicate function that validates the object passed in. Note that types are always objects. (If you want scalars, just use scalars.)

## Improving the type system
It should be posisble to allow variants of a type, and thus to do exhaustiveness-checked pattern matching on a type across its variants.

There should be streamlined way of a version of Haskell/PureScript's `newtype`, which will be an object with a type tag and a value tag. Of course, all of this will be flagrantly visible to the runtime and introspectable, since *everything* is now simple maps. I think that is a feature, not a bug. But there are some footguns here.

## Improving the type system, or not
One of the pressure points here is that the Haskell-style type system is nominal, and multimethods are 