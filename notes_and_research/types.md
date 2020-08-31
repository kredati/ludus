# Some more deep thoughts on types

## Currently
Ludus has an incredibly simple type system: you get a "ludus/type" tag that holds a Record (of the value-identical kind I pulled down from the proposal for Records and Tuples). You can switch on type in a multimethod by simply extracting the value of "ludus/type."

### But we can simplify it!
ETA, 8/30/20: You don't even need a record. We should never worry about the fact that you can hand-craft an object. Consider the following:

```javascript
let vector = (x, y) => ({x, y, 'ludus/type': vector});
let v1 = {x: 1, y: 2, 'ludus/type': vector};
let v2 = vector(1, 2);
eq(v1, v2); //=> true // dispatches to Object[Symbol.for('ludus/eq')]
```
Conventionally, we would also want an `is_vector` predicate function, using whatever `spec` dsl we get.

#### and now, back to before the edit...

Also, a type accepts an arbitrary predicate function that validates the object passed in. Note that types are always objects. (If you want scalars, just use scalars.)

## Improving the type system
It should be posisble to allow variants of a type, and thus to do exhaustiveness-checked pattern matching on a type across its variants.

There should be streamlined way of a version of Haskell/PureScript's `newtype`, which will be an object with a type tag and a value tag. Of course, all of this will be flagrantly visible to the runtime and introspectable, since *everything* is now simple maps. I think that is a feature, not a bug. But there are some footguns here, including the ability to .

The risk here is going whole hog on ADTs, which I think is both possible and a mistake. (It could be a library or an addon, but should not be in the core.)

Spec could make constructor-predicates extremely useful.

One of my concerns, however, is ensuring that you have stronger guiderails for making sure somebody can't fake a constructed type.

### edited to add
8/30/20: Don't worry about this! Keep it simple. Let users fake things. The pre/post predicates on functions will do really well. You'll discover the abstractions that put this together as things go on.

## Names and structures
Then again, improving the *structural* type system (e.g. row polymorphism) seems more important than getting a really robust nominal type system. This is mostly for polymorphic dispatch. I shall have to investigate this further.

## Multimethods and values
One of the pressure points here is between structural and nominal typing. In many ways, the thrust of Clj/Ludus is structural; the limitation is that because objects are a reference, not a value, type in JS, it requires some heavy lifting to get them to be value-typed.

I can make it a bit lighter by modifying the code to recursively convert objects and arrays; functions only make sense as reference-equal. (Excluding constructed objects makes sense as a limitation, since I suspect they'll be rare.) The use case for records is, ultimately, keeping things in maps for multimethods, and also for some type recordkeeping. In many ways, that means I can revise the Record and Tuple code there to make more sense.

### edited to add, August 31, 2020
There are a few considerations here that will require some sorting out:
* One principle, which I keep failing at, is to not worry about optimizing things too early. Prototype-based dispatch will of course be faster than multimethod dispatch, but the latter is so much easier to design around (not to implement!), and idiomatically Ludus. Prefer idiomatic versions for now, and then optimize what seems to need it. (NB: I just did a basic perf test on creating Records vs. objects. ::sigh:: Just what I was not going to do. Good news is that while it's slower, it's within an order of magnitude.)
* I keep thinking about multiple dispatch and types wrong, especially when (if) I'm thinking about structural vs. nominal typing. In Ludus you cannot create types, at least not in the sense that I keep thinking (OOP classes or Haskell-style datatypes)! There are a fixed number of types: strings, numbers, symbols, booleans, functions, array(-like things), and objects. That's it!
* The sort of thing you'd usually think of for dispatch does not have to be on types, but rather on descriptive shapes of data. I'll need good ways of describing shapes of data, but that should be easy enough--and something that belongs in Ludus rather than in JS.
* More to the point, if we're in a scene where the type/object model is so simple, but which apparently proceed according to different models than what I hold in my head, the only thing to do is to devise the system and sort out what the behaviors look like in practice, what affordances, abstractions, and conventions I need to establish.

