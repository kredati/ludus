# Ludus
## A Logoish, Lispish language for learning
Ludus is an attempt to build a programming language and environment dedicated to learning. In this, it hews as closely as possible to the spirit of Logo, developed at MIT from the 1960s through the 1980s, by Seymour Papert and his collaborators. Ludus is Roger Caillois's term, in _Man, Play, and Games_, for structured, rule-bound play. (Its unstructured complement, _Kredati_, is the name for Ludus's graphical environment.)

Ludus's design goals are simplicity and accessibility, understood as comprehensively as possible.

As of right now, Ludus exists as some design principles, and informal language specification, and ongoing work to devise a standard library.

Ludus is part of the SSHRC-funded project, "Thinking with Computers: Seymour Papert and the Invention of Computational Personhood," run by Scott Richmond at the University of Toronto. Matthew Nish-Lapidus is a collaborator.

### Ludus and Javascript
Ludus is its own programming language---or, if you want to quibble about the difference between dialect and language: Ludus is a very, very weird dialect of Javascript. It is a strict subset of JS. Ludus is, in fact, explicitly JS: valid Ludus is always valid Javascript (with some minor exceptions at the REPL). Ludus is written in JS. It runs in JS. It does not, however, look much like idiomatic JS.

JS is like English: faintly stupid, with a million warts, incredibly flexible, and understood nearly everywhere. Ludus is JS partly because of the accessibility: every web browser has a JS engine, and it's easily available as a local runtime, as Node or Deno. JS is also, weirdly, a cousin of Logo's: Logo and JS are both, in their ways, attempts to implement Lisp in ways that are more accessible. Nevertheless, Ludus is constrained by the (widely understood to be flawed) design decisions in Javascript.

### Functional-forward and immutable
Ludus takes its inheritance from Lisp very seriously; it also has learned lessons from more recent development in Lisps. In particular, Ludus is deeply inspired not only by Logo but also by Clojure, the most successful "modern" Lisp. Almost everything in Ludus is functional, and almost all of that is purely functional. Ludus has explicit, simple, and straightforward state management, inspired by Clojure. It has fast, immutable arrays modeled on Clojure's vectors.

### Expressive and syntactically simple
Ludus is not a Lisp---it does not use S-expressions. In addition, as it relies on JS's underlying semantics, it cannot, quite, be completely expression-based. But it gets close.

#### Expressions
The basic unit of Ludus is the _expression_. Here are a few examples: `3` (a number literal), `[1, 2, 3]` (an array literal), `{foo: 'bar'}` (an object literal), `add(1, 2, 3)` (a function invocation). Expressions can be literals, variables, function calls, etc. That said, unlike in JS, expressions allow no operators: everything you would do with an operator (`===`, `+`, `**`, etc.) in JS, you do with functions in Ludus (`eq`, `add`, `pow`, respectively). This leads to syntactic simplicity, as well as the ability to make arbitrary departures from JS's behaviors.

#### Statements
Statements in Ludus are how we evaluate expressions. The simplest statement in Ludus is `<expression>;`. Any expression followed by a semicolon evaluates the expression. At the REPL,  So, `3;` evaluates to `3`. (We will write this as `3; //=> 3`.) Note that at the REPL, to evaluate the line you have typed, you _must_ end it with a semicolon; without the semicolon, Ludus will assume you are still writing an expression.

##### `let`
That said, to bind values to names (assign values to variables), we use JS's `let` staements: `let {name} = {expression};`. Note that a name can only be bound once per scope. (Ludus uses JS's lexical scoping rules.) Also, because the assignment operator can _only_ be used in a `let` statement, you may never re-bind a variable. `let foo = 3; foo = 4;` is valid JS, but Ludus will throw a SyntaxError for the second statement. Meanwhile, `let foo = 3; let foo = 4;` will also throw, because JS will allow the declaration of a variable only once per scope.

##### `return`
Functions whose body is a block (and not a single expression---see below) _must_ end with a return statement: `return <expression>;`. Functions may return `undefined`, by explicitly writing `return undefined;`---but they must return something explicitly.

##### `import` and `export`
The other statements allowed in Ludus are `import`s and `export`s, using a limited version of JS's ES6+ module system. While the Ludus environment is automatically loaded and globally available at the REPL, each Ludus file must begin a Ludus import statement: `import Ludus from <source>;`. (We're still working on the standard source. Also, the import need not be named `Ludus`, `import L from <source>;` works equally well.)

### Other differences from JS
Ludus has several other key departures from JS.

#### Standard library
Ludus makes JS's standard library unavailable. The parser will complain if you try, say, to access `Math.random`: `Math` will be out of scope. Instead, it provides its own, which are functional, immutable, and rather saner in many cases.

#### Functions
Unlike JS, Ludus has the concept of a function literal, and it is the only way to make a function in Ludus. In JS, it's the arrow-function syntax: `(<parameter list>) => <body>`. That said, Ludus provides a function, `defn`, that allows for more robustly implemented functions. Take an example: `let foo = defn({name: 'foo', body: (x) => str('foo ', x)});`. If you call `foo();`, you'll get an error that you've supplied the wrong number of arguments. `defn` allows for much more (argument typechecking, variadic behavior, tail-call elimination, and so on).

#### Types
Ludus comes with what you'd expect for types if you're thinking we're trying to simplify JS: undefined, boolean, number, string, array, object, function. It also comes with a few others: `List`, a singly linked list; `Spec`, which is allows for robust validation; `Seq`, which is an abstraction over anything that can be iterated; `Ref`, which allows for stateful operations; etc. 

Ludus allows for the definition of new types (it has a `Type` type), which is what `List` et al. use under the hood. That said, it has no concept of inheritance.

#### Namespaces and objects
Ludus does not allow dot-property access to objects (JS: `let foo = {bar: 1}; foo.bar; //=> 1`) or bracket access (JS: `let foo = {bar: 1}; foo['bar']; //=> 1`), with one exception: namespaces allow dot-property access. Namespaces are special objects (made by a `defns` function) that will raise an error if you attempt to access a property that doesn't exist on them. To access properties on normal objects, you use a `get` function (the valid Ludus for the above: `let foo = {bar: 1}; get('bar', foo); //=> 1`). For many users of OO languages, where dot-properties are quite central, this may feel inelegant. Indeed. But it allows substantially better behavior. (Also, `get` is variadic; `get('bar')` returns a function that gets `bar` from anything you pass it, including `undefined`.)

##### Types and namespaces
Namespaces and types go hand in hand; types can be associated with namespaces. Thus, the `Num` namespace contains the functions that are associated with numbers; `Obj` with objects; `Arr` with arrays, and so on. (`get` is in the `Obj` namespace). This allows for a simple, but robust, kind of polymorphism.

#### Methods


#### Better default behavior and errors

#### No implicit coercion

#### Value equality

#### Conditionals

#### Errors

#### Loops

#### Escape hatches

### State and `ref`s
