# Some more deep thoughts on types

## Currently
Ludus has an incredibly simple type system: you get a "ludus/type" tag that holds a Record (of the value-identical kind I pulled down from the proposal for Records and Tuples). You can switch on type in a multimethod by simply extracting the value of "ludus/type."

Also, a type accepts an arbitrary predicate function that validates the object passed in. Note that types are always objects. (If you want scalars, just use scalars.)

## Improving the type system
It should be posisble to allow variants of a type, and thus to do exhaustiveness-checked pattern matching on a type across its variants.

There should be streamlined way of a version of Haskell/PureScript's `newtype`, which will be an object with a type tag and a value tag. Of course, all of this will be flagrantly visible to the runtime and introspectable, since *everything* is now simple maps. I think that is a feature, not a bug. But there are some footguns here, including the ability to .

The risk here is going whole hog on ADTs, which I think is both possible and a mistake. (It could be a library or an addon, but should not be in the core.)

Spec could make constructor-predicates extremely useful.

One of my concerns, however, is ensuring that you have stronger guiderails for making sure somebody can't fake a constructed type.

## Names and structures
Then again, improving the *structural* type system (e.g. row polymorphism) seems more important than getting a really robust nominal type system. This is mostly for polymorphic dispatch. I shall have to investigate this further

## Multimethods and values
One of the pressure points here is between structural and nominal typing. In many ways, the thrust of Clj/Ludus is structural; the limitation is that because objects are a reference, not a value, type in JS, it requires some heavy lifting to get them to be value-typed.

I can make it a bit lighter by modifying the code to recursively convert objects and arrays; functions only make sense as reference-equal. (Excluding constructed objects makes sense as a limitation, since I suspect they'll be rare.) The use case for records is, ultimately, keeping things in maps for multimethods, and also for some type recordkeeping. In many ways, that means I can revise the Record and Tuple code there to make more sense.
