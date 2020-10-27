# On methods & protocols
## Or, discovering the meaning of Clojure by writing Ludus

Or should we call them interfaces?

In any event, the idea here is that we can (and should?) have specs and predicates not only for types, but also for what those types' namespaces implement: in other words, what methods a particular type implements. For example, `coll` can be thought of as a set of data structures (`object`, `array`, `list`), or it can be thought of as a set of methods (`conj`, `empty`). The former approach is, in some sense, easier (and entails simpler predicate tests); the latter approach is more extensible: it allows the user to use the type system to implement new `coll`s.

I don't think this matters for now, in the sense that, like, Clojure and Logo, real-world end-user use will probably tend toward simply manipulating built-in data structures. But now that I'm finally getting around to programming the abstractions over collections (sequences, transducers, etc.), I'm also finally getting to the point where I'll be relying on methods as an abstraction.

### On methods
The idea is that a protocol is a collection of methods a type's namespace must implement; protocols therefore rely on method implementations, and I haven't actually done that yet.

In some sense, a method is a very straightforward thing: it simply abstracts the process of pulling something out of a namespace: `meta(x).ns[$methodname]`. And then once you have a method, say, `conj`, you can use `method('conj', x)` to get the `conj` function in `x`'s namespace. The kind of nice thing about the way methods work in Ludus is that they don't automatically switch on their first argument; you can write methods that switch on any arbirtary argument. So `let conj = (coll, el) => method('conj', coll)(coll, el)`, but `let cons = (el, coll) => method('cons', coll)(el, coll)`. This doesn't get us to multiple dispatch, but it is more flexible than JS's (and other OO-based) methods. (We can do full multimethods, but I'm not sure what the use case is for them, really. It belongs later in the design process, like pattern matching--something that may be nice but might not be necessary.)

### Speccing methods
The spec for a method, ultimately, is something like "has the method in the namespace." Now, the way namespaces are organized, you'll get an error like `conj is not defined in namespace Num` if you give a number to `conj`, as above. But to get a more robust error, we'd ideally like this to be a spec: `42 failed to conform to spec implements<conj>: conj is not defined in namespace Num` is a bit more helpful. And, once you have (e.g.) `implements`, you have `protocol`: the `and` of two or more `implements` specs.

### Where do protocols belong?
The question, then, is where to defined methods and protocols. It strikes me that they might come at the very, very beginning of Ludus: with predicates, before functions and specs. That said, given the fact that the methods themselves don't come until later (i.e. the functions in those namespaces are all part of `signed`, that means that `implements` and `protocol` are largely useless in the early stages. That's not a reason not to include them, but it does seem important that a protocol-based test won't work until later in the development. In other words, the fact of the matter is that I'm not touching protocols and methods until I'm working with transducers, and that suggests I can put them off.
