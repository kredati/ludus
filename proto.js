// prototype-based polymorphism
// probably I'll need an inheritance chain that is separate from the JS mess
// the idea is for multimethods to install themselves on this prototype chain
// that way I'm not munging with the weird JS inheritance stuff (is [] instanceof Array? And instanceof Object is kind of a mess. And so are the atomic types.)
// (I may revise this if it turns out performance is an issue.)
// The idea is that multimethods install a method on the prototype, and dispatch using the prototype chain.
// I need a function that calls one of these methods (think `$call`). Basically, I need a functional abstraction over method calls. (I can even avoid `this` here, since every function will be stateless. That said, the API will be such that the instance of the datatype it's called on is passed as the *first* argument to the pure function.)
// I think this is enough to get multimethods using prototypes in addition to/in place of functional tests. (Functional tests, as currently already exist in multi.js, should be optional!--since they allow for simpler, if slower, dispatch, that responds to the shape of the data rather than its type.)
// This will mean getting careful about inheritance, figuring out if there's a plausible single-chain inheritance diagram for the types I need, etc.
// This will also likely mean setting up an additional system of defining new types.
// That said, the dispatch system, as long as it presumes an abstraction to be followed elsewhere, will be able to be separate from designing the concrete inheritance diagram.
// And *that* said, if it is possible, it is worth being sure that the Ludus system for declaring and implementing types/dispatch is robust enough that it can be what I use to build out the inheritance hierarchy in the first place.