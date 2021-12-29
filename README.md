# Ludus
### THIS REPOSITORY IS FOR REFERENCE AND RESOURCE ONLY. IT IS NO LONGER UNDER ACTIVE DEVELOPMENT.

[View the docs.](doc/global.md)

## A Logoish, Lispish language for learning
Ludus is an attempt to build a programming language and computational environment dedicated to learning, exploration, discovery, and creativity. In this, it hews as closely as possible to the spirit of Logo, developed at MIT from the 1960s through the 1980s, by Seymour Papert and his collaborators. _Ludus_ is Roger Caillois's term, in _Man, Play, and Games_, for structured, rule-bound play. (Its unstructured complement, _Kredati_, is the name for Ludus's graphical environment, not described here.)

Ludus's design goals are simplicity, expressivity, and accessibility, understood as comprehensively as possible.

As of right now, Ludus exists as some design principles, and informal language specification, and ongoing work to devise an environment, a standard library, a parser, and a REPL.

Ludus is part of the SSHRC-funded project, "Thinking with Computers: Seymour Papert and the Invention of Computational Personhood," run by Scott Richmond at the University of Toronto; Matthew Nish-Lapidus is a collaborator.

### Goals: simplicity and accessibility
The three design goals are simplicity, expressivity, and accessibility. The latter drives the former.

#### Accessibility
By _accessibility_, we mean: Ludus should be easy to run and use with the tools most users have ready-to-hand. Before anything else, the first consideration is: can something be done directly, without additional overhead, or implicit knowledge, or general computer knowhow, or downloading software, etc.? This has driven the choice of platform, Javascript, since it runs more or less everywhere, in a web browser. (But also, JS and Logo are weird cousins, see below.) Wherever there is a barrier to entry or progression, it should always be put under strict scrutiny, and should be managed in ways that are always pedagogical and impart knowledge beyond the fiddly bits of making something work. But also: errors should be helpful; interactive programming is a norm; we start with graphics. In other words, Ludus is tuned to the interests and skills of people who are not (yet) computer people. (This document, however, presumes lots of computer knowledge.)

#### Simplicity
By _simplicity_, we mean: Ludus should, as much as possible, embody the ethos and aesthetics of Logo (and also Scheme, and _SICP_): small, simple parts, put together in intelligent ways, that are (or could conceivably be) within the grasp of the user without many years of training. To the greatest extent possible: no black boxes. This follows from accessibility. Ludus may appear difficult or weird to people who have learned to program in other idioms; but that is a question of ease or familiarity, not of simplicity. The difficult design goal, however, is to employ simplicity in the service of accessibility. If simplicity requires difficulty, that's a design problem to solve.

#### Expressivity
The double goal of expressivity means: Ludus code should be "expressive," in the sense that it should communicate very clearly its intention, in elegant ways. It also should allow for "expressive programming," meaning it should allow people to do things they want to do, and say the things they want to say---before their intentions have been tuned to computational affordances. In other words, it should allow programming to correlated to human expression and intention. (This is what computer interfaces do, but that is not often thought about in programming languages.)

#### Non- and anti-goals
There are a number of goals we are explicitly not concerned with, or are so far down on the priority list that they don't really count as goals, or are things we are actively avoiding.

##### Speed
Ludus will have to support reasonably complex animation in web browsers. But it is not trying to run webservers, or "real" programs. Simplicity and expressivity and accessibility come before speed. It needs to be fast _enough_, but no faster. That said, it will likely support multiple "environments," some of which (interactive programming) will include the overhead of spec-checking, and some of which (running animations) will not to avoid many nested complex conditionals.

##### Interoperation
While Ludus does involve escape hatches to the underlying Javascript (see below), it is not designed to play nice with the larger Javascript ecosystem or world. (In fact, it is actively antagonistic to a number of core Javascript idioms.) If a user wants to rely on functionality from a library, that's certainly possible, but it will require both knowledge of Javascript and the development of a translation layer to make it available in Ludus. Ludus doesn't exactly get in your way; nor does it guide you.

##### Comprehensiveness
Ludus is not really a general-purpose programming language. It is meant to develop, in Seymour Papert's terms, a series of "microworlds" that facilitate a playful, creative, discovery-based relation to computing and what it can do. If you need a language to solve an arbitrary computational problem, probably don't use Ludus. (And if you discover you want to solve such a problem using Ludus, it's probably time to learn Clojure or JS or Python.) That said, Ludus's discovery-relation will eventually extend pretty far into general-computing problems (we start with a 2D graphics package and some very basic natural language processing, like Logo, but we may well get to a basic web server). That said, Ludus is not just for engagement with microworlds, but for also their creation; that means it extends rather further than just what learners are doing.

##### Training
Ludus is meant to teach people (largely at the university level) to think with computers, and thus might be usefully considered a playground for "computational thinking" (whatever you take that to mean). But it is not meant to train students in the idioms of mainstream programming languages or ecosystems. That said, we do hope that working Ludus will make it easier to learn other kinds of programming.

### Ludus and Javascript
Ludus is its own programming language---or, if you want to quibble about the difference between _dialect_ and _language_: Ludus is a very, very weird dialect of Javascript. It is a tiny, very strict, subset of JS. Ludus is, in fact, explicitly JS: valid Ludus is always valid Javascript (with some minor exceptions at the REPL to make interactivity easier). Ludus is written in JS. It runs in JS. It does not, however, look like idiomatic JS.

JS is like English: faintly stupid, with a million warts, incredibly flexible, and understood nearly everywhere. Ludus is JS partly because of the accessibility: every web browser has a JS engine, and it's easily available as a local runtime, as Node or Deno. JS is also, weirdly, a cousin of Logo's: Logo and JS are both, in their ways, attempts to implement Lisp in ways that are more accessible (to children, to the unwashed masses using the web). Nevertheless, Ludus is constrained by the (widely understood to be flawed) design decisions in Javascript.

### Functional-forward and immutable
Ludus takes its inheritance from Lisp very seriously; it also has learned lessons from more recent development in Lisps. In particular, Ludus is deeply inspired not only by Logo and Scheme, but also by Clojure, the most successful "modern" Lisp (and also a "hosted" language, that runs in other languages' runtimes). Almost everything in Ludus is functional, and almost all of that is purely functional (i.e. no state changes, just pure input and output). Ludus has explicit, simple, and straightforward state management, inspired by Clojure. It has fast, immutable arrays modeled on Clojure's vectors. It has highly optimized and abstracted functions over collections.

### Expressive and syntactically simple
Ludus is not a Lisp---it does not use S-expressions. In addition, as it relies on JS's underlying semantics, it cannot, quite, be completely expression-based. But it gets close. Ludus has very, very little syntax.

#### Literals
Ludus has the following literal syntax units: undefined (`undefined`); booleans (`true`/`false`); numbers (ints and floats, `-3` and `12.43` and `Infinity` [and also, :(, `-0`], and perhaps bigints [`123n`]---but not yet); strings (`'foo'`, `"foo"`---and probably also template strings, `foo ${inc(1)}`.); arrays (`[1, 2, 3]`); objects (`{a: 1, b: 2}`); and functions (`() => {}`).

#### Expressions
The basic unit of Ludus is the _expression_. Here are a few examples: `3` (a number literal), `[1, 2, 3]` (an array literal), `{foo: 'bar'}` (an object literal), `add(1, 2, 3)` (a function invocation). Expressions are made up of literals, variables, and function invocations. That said, unlike in JS, expressions allow (nearly) no operators: just about everything you would do with an operator (`===`, `+`, `**`, etc.) in JS, you do with functions in Ludus---`eq`, `add`, `pow`, respectively (exceptions below). This leads to syntactic simplicity, as well as the ability to make arbitrary departures from JS's behaviors, since just about everything is now done by functions that are in the Ludus standard library.

#### Statements
Statements in Ludus are how we evaluate expressions. The simplest statement in Ludus is `<expression>;`. Any expression followed by a semicolon evaluates the expression. At the REPL,  So, `3;` evaluates to `3`. (We will write this as `3; //=> 3`.) Note that at the REPL, to evaluate the line you have typed, you _must_ end it with a semicolon; without the semicolon, Ludus will assume you are still writing an expression. (That said, there are a few rules we have yet to discover around newlines, to make sure to play nice with JS's automatic semicolon insertion [ASI].) In addition, there are a few things we have to use statements to do, since JS is, at its core, a statement-based language.

##### `let`
To bind values to names (assign values to variables), we use JS's `let` staements: `let <name> = <expression>;`. Note that a name can only be bound once per scope. (Ludus uses JS's lexical scoping rules; names can be shadowed.) Also, because the assignment operator can _only_ be used in a `let` statement, you may never re-bind a variable. `let foo = 3; foo = 4;` is valid JS, but Ludus will raise a parsing error for the second statement. Meanwhile, `let foo = 3; let foo = 4;` will also raise an error (a `SyntaxError`), because both Ludus and JS will allow the declaration of a variable only once per scope. (We don't yet know whether we will allow multiple bindings per `let` statement, e.g. `let foo = 3, bar = 4;`)

##### `return`
Functions whose body is a block (and not a single expression---see below) _must_ end with a return statement: `return <expression>;`. Functions may return `undefined`, by explicitly writing `return undefined;`---but they must always return something explicitly. (Is this right? Maybe they don't? I am thinking of early uses of function literals for `repeat`, and introducing `return` that early is probably too much. Perhaps requiring a `return` statement will be a parser option? Or omitting a `return` statement causes a parser warning instead of an error?)

##### `import` and `export`
The other statements allowed in Ludus are `import`s and `export`s, using a limited version of JS's ES6+ module system. While the Ludus environment is automatically loaded and globally available at the REPL, each Ludus file must begin a Ludus import statement: `import Ludus from <source>;`. (We're still working on the standard source. Also, the import need not be named `Ludus`, `import L from <source>;` works equally well. It may well be the case that `import <source>;` will be sufficient, if Ludus globalizes a bunch of things. See also the notes on namespaces and parsing.)

### Other differences from JS
Ludus has several other key departures from JS.

#### Standard library
Ludus makes JS's standard library unavailable. The parser will complain if you try, say, to access `Math.random`: `Math` will be out of scope. Instead, it provides its own, which are functional, immutable, and rather saner in many cases. (There are ways of breaking through Ludus's attempts to prevent you from accessing JS's very mutational standard library, but they require you to know what you're doing---and to intentionally break things.)

#### Functions
Unlike JS, Ludus has the concept of a function literal, and it is the only way to make a function in Ludus. In JS, it's the arrow-function/lambda syntax: `(<parameter list>) => <function body>`. The function body is either an expression or a block set off by curly braces---`{`, `}`---containing a series of statements: `let`, `return`, and bare expressions. No `function` keyword. That said, Ludus provides a function, `defn`, that allows for more robustly instrumented functions. Take an example: `let foo = defn({name: 'foo', body: (x) => str('foo ', x)});`. If you call `foo();`, you'll get an error that you've supplied the wrong number of arguments. `defn` allows for much more (argument typechecking, variadic behavior, tail-call elimination, and so on). There are other ways of instrumenting functions as well, including `fn`.

#### Types
Ludus comes with what you'd expect for types if you're thinking we're trying to simplify JS: undefined, boolean, number, string, array, object, function. It also comes with a few others: `List`, a singly linked list; `Spec`, which allows for robust validation; `Seq`, an abstraction over anything that can be iterated; `Ref`, which allows for stateful operations; and so on.

Ludus allows for the definition of new, user-defined types (it has a `Type` type!), which is what `List` et al. use. That said, it has no concepts of inheritance or prototypes or classes or subclasses. The `this` keyword is prohibited. (There is a long list of prohibited keywords in Ludus, in the notes folder.)

#### Namespaces and objects
Ludus does not allow dot-property access to arbitrary objects (JS: `let foo = {bar: 1}; foo.bar; //=> 1`) or bracket access (JS: `let foo = {bar: 1}; foo['bar']; //=> 1`). There is one exception: _namespaces_ allow dot-property access. Namespaces are special objects (made by an `ns` special form) that will raise an error if you attempt to access a property that doesn't exist on them. To access properties on normal objects, you use a `get` function (the valid Ludus for the above: `let foo = {bar: 1}; get('bar', foo); //=> 1`). For many users of OO languages, where dot-properties are quite central, this may feel inelegant, verbose, and frankly unnecessary. Indeed. But it allows substantially better behavior. (Also, `get` is variadic; `get('bar')` returns a function that gets `bar` from anything you pass it, including `undefined`, which gets you Nice Things(TM). Meanwhile, `get` only accesses own properties at string keys, and so doesn't let you access JS prototype methods on objects or arrays.) This is also for Ludus/JS security reasons: `get` does not traverse the prototype chain; it only gets "own" properties. (`get_`, however, is the escape hatch here.)

##### Types and namespaces
Namespaces and types go hand in hand; types can be associated with namespaces. Thus, the `Num` namespace contains the functions that are associated with numbers; `Obj` with objects; `Arr` with arrays, and so on. (`get` is in the `Obj` namespace, but can be used on arrays, too). Namespaces that are associated with types always have their type at `.t`; `Num.t` gives you the Ludus representation of the number type. This allows for a simple, but robust, kind of polymorphism (see the next point). Also, you can get the namespace of anything: `NS.get_ns(4); //=> ns:{Num}`.

#### Methods
Sometimes, functions with the same name and purpose exist for multiple types in multiple namespaces. For example, various versions of `conj` add an element to the end of a string, an array, a sequence, or to the beginning of a list (`Str.conj`, `Arr.conj`, `Seq.conj`, and `List.conj`, respectively). That means the there are (at least) four `conj` functions, each in different namespaces. Because we can easily get the namespace of anything (using `get_ns`), that means we can fairly easily write a more general `conj` that knows which `conj` to call based on the type of its first argument. This kind of general function is a method. (This is closely related to, but decisively different from, than OO methods, since Ludus namespaces do not encapsulate any state.) Methods dispatch to the namespace that's associated with the type of their first argument. This dispatch is also dyanmic, meaning that if we wanted to define a new datatype that has a `conj` function associated with it (say we wanted to implement a doubly linked list), the `conj` method would dispatch properly to it. Many of the functions in the `Ludus` namespace (i.e. `core` functions) are methods.

We make methods using `defmethod`. This is the actual definition of `conj`: `let conj = defmethod({name: 'conj', doc: '...'});`. There's an optional `not_found` property on the descriptor which handles default behavior.

#### Naming conventions
JS-world prefers `camelCase`; Ludus prefers `snake_case`. In addition, in Ludus, only namespaces may have names that begin with a capital letter; this is to allow the parser to enforce no dot-property access to anything but namespaces. Types bound to namespaces are always found at `.t` in their namespace.

#### Better default behavior
JS, famously, has wonky default behaviors. (See Gary Bernhardt's talk ["Wat"](https://www.destroyallsoftware.com/talks/wat) for a delightful demo.) Ludus tries to ensure sane defaults that don't blow up quite so unexpectedly or spectacularly. For example, dividing by zero raises an error instead of giving you Infinity. Or `add(3, 'foo'); //=> err: Arguments to add did not conform to spec...` gives you an error instead of `3 + 'foo'; //=> '3foo'`. I believe the number functions cannot under any circumstances, return `NaN`. Much of this is handled by avoiding situations in which JS performs type coercion (e.g., operators such as `==` and `+`); much of the rest of is accomplished because, wherever useful, Ludus's standard library functions are specced to do runtime type checking. Also, Ludus allows for easy conversion between types, but always requires those conversions to be explicit with functions (`Bool.bool(0); //=> true`; `Str.str(true); //=> 'true'`; `Num.num('3.2'); //=> 3.2`; etc.).

#### Better errors
One of the major sub-goals of Ludus is to have better, more informative errors that help guide interactive programming. This is part of the accessibility mandate. The simplicity and strictness will help: between the specced functions and a robust parser (TK), the goal is to surface errors quicly and consisently improve them. Studies have shown (citation needed!) that the most common errors for learners are problems with arguments (number or type), or attempting to access variables incorrectly (out of scope, undeclared, etc.). Specced and defn'ed functions take care of the first; the parser will (mostly) handle the latter. Also, because you can't re-bind names in Ludus, a lot of early, difficult reasoning about variables in imperative programming about "what is the value of `foo` now?" is redundant.

#### No implicit coercion
As above, there is never any implicit type coercion. To get `'3'` from `3`, you need to use `str(3); //=> '3'`. That said, there are abstractions that let you be indifferent to type, as with methods---but they really do follow the principle of least surprise.

#### Value equality
The modal method of evaluating equality in Ludus is the function `eq`, which produces something like intuitive answers. (Nothing is ever intuitive in programming; and "are two things the same?" is actually a hard problem, algorithmically and philosophically.) There are generally speaking two types of equality in programming: value equality and reference equality. `3` is always equal to `3`; `'foo'` is always equal to `'foo'`. This is value equality: their values are the same even though you've typed them out twice. Reference equality is more commonly found for compound types, like arrays and objects. In Ludus, `eq([1, 2, 3], [1, 2, 3]); //=> true`; in JS `[1, 2, 3] === [1, 2, 3]; //=> false`. Why? In JS I could modify one array without modifying the other, and then they would no longer be equal: each literal is actually a reference to a different actual data structure held somewhere else in memory; they can be maniuplated independently. But in Ludus, arrays and objects are effectively immutable; so `eq` compares based on value equality. The only type in Ludus that continues to use reference equality is function.

##### Equality as a method
In addition, `eq` is written to allow access to `eq` as a method. This should mostly not be necessary, and comes _after_ equality across iteration (meaning that if your type implements an `iterate` method, you won't get to the `eq` method; is this right?). But that allows for arbitrary equality manipulation.

#### Conditionals
In Ludus, because we want all the things to be expressions, we want conditional expressions rather than statements. We thus get rid of JS's statement-based flow constructs, `if`/`else`/`switch`---and use a version of ternary expressions. However, not only are ternaries a bit terse on their own, they use JS's (bad) coercion to booleans for truthy and falsy. So, Ludus uses a "special form": `when(<expr>) ? <if_true_expr> : <if_false_expr>;`. The `?`/`:` there is a ternary expression in JS. In Ludus, they may _only_ be used after a call to `when`.

Ludus does also include much lispier conditionals with `cond` and `fcond`, which avoid the necessity of nested ternaries, which can get ugly fast. However, they also have the drawback of requiring the use of functions (to defer exectuion) rather than bare expressions and some titchy punctuation, e.g.,

```javascript
let foo = fcond( // fcond is "functional cond," which returns a unary function instead of evaluating it against a value
    // each of the lines below is a "cond clause"---a tuple of two functions: condition and execution
    // note that variadic "partial application" versions of functions make this much more readable & intuitive
    [eq(10),    sub_by(2)], // if (x === 10) return x - 2;
    [eq(11),    inc(1)], // if (x === 11) return x + 1;
    [gte(13),   mult(2)], // if (x >= 13) return x * 2;
    [always,    just('oops')] // else return 'oops';
);
foo(10); //=> 8
foo(11); //=> 12
foo(13); //=> 26
foo(14); //=> 28
foo(12); //=> 'oops'
foo('bar'); //=> 'oops'
foo(undefined); //=> 'oops'
foo(); //=> err: Wrong number of arguments to fcond...
```

#### Truthy and falsy
JS coerces some values to false that in a sane language would evaluate to true; in JS, `''` is falsy, as is `0`. Using `when` we can control what is evaluated as false: `false` and `undefined`, and that's it. This allows for forms of what Clojure calls "nil punning," where we can start to tame JS's unruly `undefined`.

#### Errors
We are hoping for excellent errors in Ludus, which are informative, and oriented towards language learners. That said, the rather intense instrumentation around functions means that stack traces are not as helpful as they might be, since often errors are many function calls down. That said, instrumented functions report out errors and therefore reproduce something like a stack trace. In place of `throw` staements, however, Ludus uses a function, `raise`. Raise will take an error prototype/function, e.g. `raise(Error, 'message');` which will report out the stack trace. But normally, you only need to raise an informative message in a string. (In JS, you can throw anything; so, too, in Ludus.)

#### Loops and recursion
Ludus does not have syntactic constructs for loops, like JS's `for` or `while` loops; it has no imperative iteration. Most places where in JS or other more imperative languages, you would use a loop to iterate through a collection, in Ludus, you would normally use a function that operates on members of a collection. In particular, Ludus has a robust set of reducing functions, modeled on Clojure's transducers (transforming reducers), and which are far more ergonomic and easily optimized than JS's equivalents (`map`, `filter`, `reduce`, etc. on arrays).

The idiomatic Ludus method for explicit looping, when it's necessary, lies in recursion: `loop`/`recur`. `recur` is a special form---a function that can only be called inside a function passed to `loop`, or inside a `defn`ed function. `loop`/`recur` performs tail call elimination for simple recursion. (Sadly, it does not allow mutual recursion; this is Clojure's solution and also its limitation.) Like Logo, and Scheme, we teach recursion early and often in Ludus. `recur` also allows for recursion inside anonymous functions that are wrapped in `loop`.

In addition, Ludus has a few constructs for repeating things: `Flow.repeat`, and `Seq.repeatedly`. `repeat` is used frequently in Logo; we want it here, too.

#### Escape hatches
That said, Ludus cannot completely do away with JS. It includes a few mutating functions that are useful to optimize for speed, which are always suffixed with an underscore, e.g. `conj_` is the mutating version of `conj` (aka `Array.prototype.push` in JS). `get_` is the messy Javascript prototype-chain-following version of `get`. These are only useful for optimization when writing functions over collections, and should be avoided at nearly all costs.

In addition, if for some reason you must drop down to JS to accomplish some task, Ludus has a special form, `js`, which is a unary function that itself takes a function literal and does not parse it for correctness, it simply passes it through to the underlying JS engine (i.e. the Ludus parser simply skips whatever is in the body of that function, but it must still be valid JS or JS will complain.)

### State and `ref`s
Almost everything in Ludus is a pure, stateless function. But if you only have pure functions, you can't do anything other than warm up your processor. Ludus handles state by means of `ref`s, or references. They are extremely simple and also very flexible and powerful. They are effectively Clojure's atoms, streamlined for the much simpler, single-threaded environment of JS (vs. Clojure's host environment, the Java Virtual Machine).

* To create a `ref`: `let foo = ref({name: 'foo', value: 42}); //=> Ref: foo ( 42 )`. It has a name and a value---any Ludus value, including compound values.
* To get the value of a `ref`, use `deref`: `deref(foo); //=> 42`.
* To change the value of a ref, `swap`: `swap(foo, 23); /// Ref: foo ( 23 )`. Anywhere you have a reference to `foo`, its value will now be `23` when you `deref` it. Note that `swap` does not return anything.
* Or, you can `update` a ref, using a function: `update(inc, foo); /// Ref: foo ( 24 )`. Note the inverted argument order; `update` can be partially applied. Also, `update` does not return anything.
* In addition, you can also `watch` a `ref`, which will call a function whenever a `ref`'s value changes. (You can also `unwatch` a `ref`.) These will be called after the event loop is cleared; they are also debounced---no matter how many times you `swap` a ref before the event loop clears, the watchers will only be called once.

Kredati, as the graphical environment which will be packaged with Ludus, will handle most of the state management internals. Most Kredati programs will not bother with state management directly using refs, but instead take the form of one (or more) reducing functions, whose signature are `(state, input) -> state`.

### Project status
Ludus is very much WIP, pre-alpha. We are still in the design phase. The foregoing is subject to change.

Bootstrapping Ludus from JS involves three phases: `prelude/unsigned`, `prelude/signed`, and `core`:
* `prelude/unsigned` starts from pure JS and builds out the very core of Ludus: types and namespaces and instrumented functions---and all the things that are required do get that done. As of mid-May 2021, this is complete and functional, but subject to revision.
* `prelude/signed` uses types, namespaces, and instrumented functions to build out the skeleton of the standard library. In particular, what is in `signed` uses fundamental Ludus constructs, but has to, for various reasons (performance, translation, etc.) rely on parts of JS disallowed in Ludus. As of May 2021, this is nearly complete.
* `core` is the rest of the Ludus standard library, written in Ludus. As of May 2021, work has not yet begun in `core`.

You can see more in the [project management doc](./project.md).
