# Ludus
## A Logoish, Lispish language for learning
Ludus is an attempt to build a programming language and environment dedicated to learning, exploration, discovery, and creativity. In this, it hews as closely as possible to the spirit of Logo, developed at MIT from the 1960s through the 1980s, by Seymour Papert and his collaborators. _Ludus_ is Roger Caillois's term, in _Man, Play, and Games_, for structured, rule-bound play. (Its unstructured complement, _Kredati_, is the name for Ludus's graphical environment, not described here.)

Ludus's design goals are simplicity and accessibility, understood as comprehensively as possible.

As of right now, Ludus exists as some design principles, and informal language specification, and ongoing work to devise a standard library, a parser, and a REPL.

Ludus is part of the SSHRC-funded project, "Thinking with Computers: Seymour Papert and the Invention of Computational Personhood," run by Scott Richmond at the University of Toronto. Matthew Nish-Lapidus is a collaborator.

### Goals: simplicity and accessibility
The two design goals are simplicity and accessibility. The latter drives the former.

By _accessibility_, we mean: Ludus should be easy to run and use with the tools most users have ready-to-hand. Before anything else, the first consideration is: can something be done directly, without additional overhead, or implicit knowledge, or general computer-knowhow, or downloading software, etc.? This has driven the choice of platform, Javascript, since it runs more or less everywhere, in a web browser. (But also, JS and Logo are weird cousins, see below.) Wherever there is a barrier to entry or progression, it should always be put under strict scrutiny, and should be managed in ways that are always pedagogical and impart knowledge beyond the fiddly bits of making something work. But also: errors should be helpful; interactive programming is a norm; we start with graphics. In other words, Ludus is tuned to the interests and skills of people who are not (yet) computer people. (This document, however, presumes lots of computer knowledge.)

By _simplicity_, we mean: Ludus should, as much as possible, embody the ethos and aesthetics of Logo (and also Scheme, and _SICP_): small, simple parts, put together in intelligent ways, that are (or could conceivably be) within the grasp of the user without many years of training. To the greatest extent possible: no black boxes. This follows from accessibility. Ludus may appear difficult or weird to people who have learned to program in other idioms; but that is a question of ease, not of simplicity.

#### Anti-goals: speed
Ludus will have to support reasonably complex animation in web browsers. But it is not trying (yet) to run webservers, or "real" programs. Simplicity and accessibility come before speed. It needs to be fast enough, but no faster.

### Ludus and Javascript
Ludus is its own programming language---or, if you want to quibble about the difference between dialect and language: Ludus is a very, very weird dialect of Javascript. It is a strict, tiny subset of JS. Ludus is, in fact, explicitly JS: valid Ludus is always valid Javascript (with some minor exceptions at the REPL to make interactivity easier). Ludus is written in JS. It runs in JS. It does not, however, look much like idiomatic JS.

JS is like English: faintly stupid, with a million warts, incredibly flexible, and understood nearly everywhere. Ludus is JS partly because of the accessibility: every web browser has a JS engine, and it's easily available as a local runtime, as Node or Deno. JS is also, weirdly, a cousin of Logo's: Logo and JS are both, in their ways, attempts to implement Lisp in ways that are more accessible. Nevertheless, Ludus is constrained by the (widely understood to be flawed) design decisions in Javascript.

### Functional-forward and immutable
Ludus takes its inheritance from Lisp very seriously; it also has learned lessons from more recent development in Lisps. In particular, Ludus is deeply inspired not only by Logo and Scheme but also by Clojure, the most successful "modern" Lisp. Almost everything in Ludus is functional, and almost all of that is purely functional. Ludus has explicit, simple, and straightforward state management, inspired by Clojure. It has fast, immutable arrays modeled on Clojure's vectors. It has highly optimized and abstracted functions over collections.

### Expressive and syntactically simple
Ludus is not a Lisp---it does not use S-expressions. In addition, as it relies on JS's underlying semantics, it cannot, quite, be completely expression-based. But it gets close. Ludus has very, very little syntax.

#### Literals
Ludus has the following literal syntax units: undefined (`undefined`); booleans (`true`/`false`); numbers (ints and floats, `-3` and `12.43` and `Infinity` [and also, :(, possibly `-0`], and perhaps bigints [`123n`]); strings (`'foo'`, `"foo"`---and probably also template strings, `foo ${inc(1)}`.); arrays (`[1, 2, 3]`); objects (`{a: 1, b: 2}`); and functions (`() => {}`).

#### Expressions
The basic unit of Ludus is the _expression_. Here are a few examples: `3` (a number literal), `[1, 2, 3]` (an array literal), `{foo: 'bar'}` (an object literal), `add(1, 2, 3)` (a function invocation). Expressions can be literals, variables, function calls, etc. That said, unlike in JS, expressions allow (nearly) no operators: just about everything you would do with an operator (`===`, `+`, `**`, etc.) in JS, you do with functions in Ludus (`eq`, `add`, `pow`, respectively) (exceptions below). This leads to syntactic simplicity, as well as the ability to make arbitrary departures from JS's behaviors, since just about everything is now done by functions.

#### Statements
Statements in Ludus are how we evaluate expressions. The simplest statement in Ludus is `<expression>;`. Any expression followed by a semicolon evaluates the expression. At the REPL,  So, `3;` evaluates to `3`. (We will write this as `3; //=> 3`.) Note that at the REPL, to evaluate the line you have typed, you _must_ end it with a semicolon; without the semicolon, Ludus will assume you are still writing an expression.

##### `let`
That said, to bind values to names (assign values to variables), we use JS's `let` staements: `let <name> = <expression>;`. Note that a name can only be bound once per scope. (Ludus uses JS's lexical scoping rules.) Also, because the assignment operator can _only_ be used in a `let` statement, you may never re-bind a variable. `let foo = 3; foo = 4;` is valid JS, but Ludus will raise an error for the second statement. Meanwhile, `let foo = 3; let foo = 4;` will also raise an error, because both Ludus and JS will allow the declaration of a variable only once per scope.

##### `return`
Functions whose body is a block (and not a single expression---see below) _must_ end with a return statement: `return <expression>;`. Functions may return `undefined`, by explicitly writing `return undefined;`---but they must return something explicitly.

##### `import` and `export`
The other statements allowed in Ludus are `import`s and `export`s, using a limited version of JS's ES6+ module system. While the Ludus environment is automatically loaded and globally available at the REPL, each Ludus file must begin a Ludus import statement: `import Ludus from <source>;`. (We're still working on the standard source. Also, the import need not be named `Ludus`, `import L from <source>;` works equally well.)

### Other differences from JS
Ludus has several other key departures from JS.

#### Standard library
Ludus makes JS's standard library unavailable. The parser will complain if you try, say, to access `Math.random`: `Math` will be out of scope. Instead, it provides its own, which are functional, immutable, and rather saner in many cases.

#### Functions
Unlike JS, Ludus has the concept of a function literal, and it is the only way to make a function in Ludus. In JS, it's the arrow-function syntax: `(<parameter list>) => <function body>`. That said, Ludus provides a function, `defn`, that allows for more robustly instrumented functions. Take an example: `let foo = defn({name: 'foo', body: (x) => str('foo ', x)});`. If you call `foo();`, you'll get an error that you've supplied the wrong number of arguments. `defn` allows for much more (argument typechecking, variadic behavior, tail-call elimination, and so on).

#### Types
Ludus comes with what you'd expect for types if you're thinking we're trying to simplify JS: undefined, boolean, number, string, array, object, function. It also comes with a few others: `List`, a singly linked list; `Spec`, which allows for robust validation; `Seq`, an abstraction over anything that can be iterated; `Ref`, which allows for stateful operations; and so on. 

Ludus allows for the definition of new, user-defined types (it has a `Type` type!), which is what `List` et al. use under the hood. That said, it has no concept of inheritance. There are no subclasses of anything.

#### Namespaces and objects
Ludus does not allow dot-property access to arbitrary objects (JS: `let foo = {bar: 1}; foo.bar; //=> 1`) or bracket access (JS: `let foo = {bar: 1}; foo['bar']; //=> 1`), with one exception: _namespaces_ allow dot-property access. Namespaces are special objects (made by a `defns` function) that will raise an error if you attempt to access a property that doesn't exist on them. To access properties on normal objects, you use a `get` function (the valid Ludus for the above: `let foo = {bar: 1}; get('bar', foo); //=> 1`). For many users of OO languages, where dot-properties are quite central, this may feel inelegant, verbose, and frankly unnecessary. Indeed. But it allows substantially better behavior. (Also, `get` is variadic; `get('bar')` returns a function that gets `bar` from anything you pass it, including `undefined`, which gets you Nice Things(TM).)

##### Types and namespaces
Namespaces and types go hand in hand; types can be associated with namespaces. Thus, the `Num` namespace contains the functions that are associated with numbers; `Obj` with objects; `Arr` with arrays, and so on. (`get` is in the `Obj` namespace). This allows for a simple, but robust, kind of polymorphism. Also, you can get the namespace of anything: `NS.get_ns(4); //=> Namespace { Number }`.

#### Methods
Sometimes, functions with the same name and purpose exist for multiple types. For example, various versions of `conj` add an element to the end of a string, an array, a sequence, or to the beginning of a list (`Str.conj`, `Arr.conj`, `Seq.conj`, and `List.conj`, respectively). That means the there are (at least) four `conj` functions, each in different namespaces. Because we can easily get the namespace of anything, that means we can fairly easily write a more general `conj` that knows which `conj` to call based on the type of its first argument. This kind of general function is a method. (This is closely related to, but decisively different from, than OO methods.) Methods dispatch to the namespace that's associated with the type of their first argument. This dispatch is also dyanmic, meaning that if we wanted to define a new datatype that has a `conj` function associated with it (say we wanted to implement a doubly linked list), the `conj` method would dispatch properly to it.

#### Better default behavior
JS, famously, has wonky default behaviors. (See Gary Bernhardt's talk "Wat" for a delightful demo.) Ludus tries to ensure sane defaults that don't blow up quite so unexpectedly or spectacularly. For example, dividing by zero raises an error instead of giving you Infinity. Or `add(3, 'foo'); //=> err: Arguments to add did not conform to spec.` gives you an error instead of `3 + 'foo'; //=> '3foo'`. Much of this is handled by avoiding situations in which JS performs type coercion; much of the rest of is accomplished because, wherever useful, Ludus's standard library functions are specced to do runtime type checking.

#### Better errors
One of the major sub-goals of Ludus is to have better, more informative errors that help guide interactive programming. This is part of the accessibility mandate. The simplicity and strictness will help: between the specced functions and a robust parser (TK), the goal is to consisently improve errors. Studies have shown (citation needed!) that the most common errors for learners are problems with arguments (number or type), or attempting to access variables incorrectly (out of scope, undeclared, etc.). Specced and defn'ed functions take care of the first; the parser will handle the latter. Also, because you can't re-bind names in Ludus, this means a lot of difficult reasoning in imperative programming about "what is the value of `foo` now?" is redundant.

#### No implicit coercion
As above, there is never any implicit type coercion. To get `'3'` from `3`, you need to use `str(3);`. That said, there are abstractions that let you be indifferent to type, as with methods---but they really do follow the principle of least surprise.

#### Value equality
The modal method of evaluating equality in Ludus is the function `eq`, which produces something like intuitive answers. (Nothing is ever intuitive, and "are two things the same" is actually a hard problem, algorithmically and philosophically.) There are generally speaking two types of equality in programming: value equality and reference equality. `3` is always equal to `3`; `'foo'` is always equal to `'foo'`. This is value equality: their values are the same even though you've typed them out twice. Reference equality is more commonly found for compound types, like arrays and objects. In Ludus, `eq([1, 2, 3], [1, 2, 3]); //=> true`; in JS `[1, 2, 3] === [1, 2, 3]; //=> false`. Why? In JS I could modify one array without modifying the other, and then they would no longer be equal: each literal is a reference to a different actual data structure held somewhere else in memory; they can be maniuplated independently. But in Ludus, arrays are immutable, and objects are effectively immutable; so `eq` compares based on value equality. The only type in Ludus that continues to use reference equality is function.

#### Conditionals
In Ludus, because we want all the things to be expressions, we want conditional expressions rather than statements. We thus get rid of `if`/`else`/`switch`, and use a version of ternary expressions. However, not only are ternaries a bit terse on their own, they use JS's coercion for truthy and falsy. So, Ludus uses a "special form": `when(<expr>) ? <if_true_expr> : <if_false_expr>;`. The `?`/`:` there is a ternary expression in JS; they may only be used after a call to `when` in Ludus.

Ludus does also include much lispier conditionals with `cond` and `fcond`, which avoid the necessity of nested ternaries, which can get ugly fast. However, they also have the drawback of requiring the use of functions (to defer exectuion) rather than bare expressions and some titchy punctuation, e.g.,

```javascript
let foo = fcond( // fcond is "functional cond," returning a function instead of the evaluation of its clauses
    [eq(10), sub_by(2)], // if (x === 10) return x - 2;
    [eq(11), inc(1)], // if (x === 11) return x + 1;
    [eq(13), mult(2)], // if (x === 13) return x * 2;
    [always, just('oops')] // else return 'oops';
);
foo(10); //=> 8
foo(11); //=> 12
foo(13); //=> 26
foo(12); //=> 'oops'
```

#### Truthy and falsy
JS coerces some values to false that in a sane language would evaluate to true: `''` is falsy, as is `0`. Using `when` we can control what is evaluated as false: `false` and `undefined` and that's it. This allows for forms of what Clojure calls "nil punning," where we can start to tame JS's unruly `undefined`.

#### Errors
We are hoping for excellent errors in Ludus, which are informative, and oriented towards language learners. That said, the rather intense instrumentation around functions means that stack traces are not as helpful as they might be, since often errors are many function calls down. That said, instrumented functions report out errors and therefore reproduce something like a stack trace. In place of `throw` staements, however, Ludus uses a function, `raise`. Raise will take an error prototype/function, e.g. `raise(TypeError, 'message');` which will report out the stack trace. But normally, you only need to raise an informative message.

#### Loops and recursion
Ludus does not have syntactic constructs for loops, like JS's `for` or `while` loops; it has no obviously imperative iteration. Most places where in JS or other more imperative languages, you would loops to iterate through a collection, in Ludus, you would normally use a function that operates on all members of a collection. In particular, Ludus has a robust set of reducing functions, modeled on Clojure's transducers (transforming reducers), and which are far more ergonomic and easily optimized than JS's equivalents (`map`, `filter`, `reduce`, etc. on Arrays).

The idiomatic Ludus methods for looping, when it's necessary, are a special form of recursion: `loop`/`recur`. `recur` is a special form---a function that can only be called inside a function passed to `loop`, or inside a `defn`ed function. `loop`/`recur` performs tail call elimination for simple recursion. (Sadly, it does not allow mutual recursio; this is Clojure's solution and also its limitation.)

In addition, Ludus has a few constructs for repeating things: `Flow.repeat`, and `Seq.repeatedly`. `repeat` is used frequently in Logo; we want it here, too.

#### Escape hatches
That said, Ludus cannot completely do away with JS. It includes a few mutating functions that are useful to optimize for speed, which are always suffixed with an underscore, e.g. `conj_` is the mutating version of `conj` (aka `Array.push` in JS). These are only useful for optimization, and should be avoided at nearly all costs.

In addition, if for some reason you must drop down to JS to accomplish some task (say, importing and using a JS library), Ludus has a special form, `js`, which takes a function literal and does not parse it for correctness, it simply passes it through to the underlying JS engine. 

### State and `ref`s
Almost everything in Ludus is a pure, stateless function. But if you only have pure functions, you can't do anything other than warm up your processor. Ludus handles state by means of `ref`s, or references. They are extremely simple and also very flexible and powerful. They are effectively Clojure's atoms, streamlined for the much simpler, single-threaded environment of JS (vs. Clojure's host environment, the Java Virtual Machine).

* To create a `ref`: `let foo = ref({name: 'foo', value: 42}); //=> Ref: foo ( 42 )`. It has a name and a value---any Ludus value.
* To get the value of a `ref`, use `deref`: `deref(foo); //=> 42`.
* To change the value of a ref, `swap`: `swap(foo, 23); //=> Ref: foo ( 23 )`. Anywhere you have a reference to `foo`, its value will now be `23` when you `deref` it.
* In addition, you can also `watch` a `ref`, which will call a function whenever a `ref`'s value changes. (You can also `unwatch` a `ref`.) These will be called after the event loop is cleared.

Kredati, as the graphical environment which will be packaged with Ludus, will handle most of the state management internals. Most Kredati programs will not bother with state management directly, but instead take the form of one (or more) reducing functions, `(state, input) -> state`.

### Project status



