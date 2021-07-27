# Thoughts about a better Ludus
What if Ludus wasn't hosted inside JS? The [performance](./performance.md) issues are enough to make me think departing from JS is a good idea. I've been fantasizing for a spell about writing a VM for a Ludus 2.0 language that has what I like about Ludus, but optimized. Rust, it turns out, is a good choice for this, and both difficult but exciting. The problem here, too, is that I won't know how fast a Rust VM running under WebAssembly will be compared to JS until I do it. Which may be a lot of work for not very much gain. JS is incredibly optimized; it's the places where I'm working against JS where Ludus as it currently exists gets slow. Ultimately, the question isn't whether I'll be able to make something faster than optimized JS written idiomatically, it's whether I'll be able to make something faster than Ludus, which fights JS at many turns.

That said, this idea also opens up a *huge* design space. Let's play with that space to see if it's worth it for *design* reasons.

I can think of three different ways to approach this design (quick heursitic):
1. From a language level: what do I like about languages?
2. From a pedagogical level: guided by Papert's insights, what design features ought we have?
3. From a historical level: can we make this more like Logo?

(Of coruse, this whole thing begs the question: why not just write a Logo interpreter in Rust? Fine--that's actually part of the plan--but Logo actually has a lot of warts.)

## Language-oriented features
Or, Scott's taste in langauges. What do I like in a language? I'm gonna have to write a bunch of this.
* Functional-forward, with an emphasis on pure functions.
* Good (bounded) state management, e.g. `ref foo <- 42`.
* An intuitive, but not simple, type system. Here are the atoms: Bools, Numbers (Ints & Floats), Strings (and template strings).
* Immutable data structures: hashes, lists, and arrays (except for when we don't want them, in which case).
* Pattern matching & destructuring.
* Sum types.
* Variadic functions.
* Expression-based, not statement-based.
* Strongly (but not necessarily statically) typed.
* Braces, not keywords (no `end`).
* Lexical scoping & closures.
* Interactive programming (what Quokka does for JS is magic).
* Excellent error messages (omg no `undefined is not a function`).
* Tuples.
* A pipeline operator (`|>` all the things).
* Graceful partial application (but do not curry all the things): `foo(42, _)`.
* A studied avoidance of everything OO, especially but not only inheritance.
* Tail-call optimization, at least for recursive calls.

### Open questions
* Static typing?
* Exceptions or `Result`s?
* Early returns? (Yes, à la Rust.)
* Significant whitespace? (Yes, but barely: newlines are ends of expressions, no meaningful indentation.)

### On immutable data structures
These can be fast! That said, I'm a little worried about performance here, and maybe I don't need to implement a HAMT. Especially if there's a way to rely on `im` in Rust, this could be quite nice.

### On typing
Stronger types mean better errors. And we want excellent errors. We will have strong types: no implicit conversions. The current iteration of Ludus already has to this; we're not going to go back.

Static types mean a faster language, because you don't have to do runtime typechecking, which is slow. They also mean better feedback: you know if code checks before you run it; even code paths you don't yet touch are correct. Static types also likely mean encountering the type system early and often, which is a higher barrier to entry. Maybe. Three things that are non-negotiable, if in fact we do static typing: type inference, row polymorphism, and graceful nilability (e.g. `String` and `String?` types, and not `Maybe<String>`: nilables aren't wrapped). These aren't trivial to implement, especially when you put them all together.

Dynamic types allow for certain abstractions that don't typecheck easily or well, like transducers. They're also optional, meaning that you can hold off on introduing students to the typechecker until later. (That's what Pyret does.) Also, dynamic typing means no type inference, which can be super helpful.

#### nil vs. Nothing
My intuition is that you want a `nil` value that's the positive absence of something: `bar:foo` gets `:foo` in `bar`, but if `bar` doesn't have something there, then you should get back `nil`, which is also spelled `()` (the empty tuple). (Maybe. But in static-land, row polymorphism suggests that we know we *have* to have something there.)

But there should also be some version of `Nothing`, that will not match in a pattern, ever. I believe Haskell calls this "bottom," spelled `_|_`. That's rather obscure, but you should not, e.g., be able to match against a statement, and you sure need to be able to match against `nil`. (Oh god, is this `null` and `undefined`?)

### On exceptions vs. Result<T, Err>
Rust does a nice job of working with `Result`s that has the feel of exceptions. But it's actually a ton of overhead. The interactivity of the thing means that I feel like runtime errors aren't necessarily to be avoided. (Also, the typechecker should work well at a REPL.) That said, nilability means we might be able to buy a way around the explosion of sum types that happens. Part of the question is: in early code, can we avoid sum types?

### On excellent error messages
We want error messages to be excellent, from the get-go. We want the error messages to be really friendly in tone, carefully explanatory--and such that they feel like they're helping you rather than fighting you. (Elm and Rust are models, although Rust is a demanding language.) I worry that static typing brings with it great error messages but also a demanding compiler.

## Pedagogy-oriented features
What is the abstraction path for learners?
1. Turtle commands: stateful changes with function invocations, `forward(100)` and `right(90)`. (Or `forward 100` and `right 90`, if that's where we land.) The errors here will be: typos (`I don't know how to fowrard`, `bad name 10n0`, or whatever you get when you type `forward(9 0)`), exploration (`forward 100` if we decide to use tuples, or `forward()`), or concatenation (`forward(100) right(90)`).
2. Repetition of turtle commands (in Logo): `repeat 4 [forward 100 right 90]`. Or: `repeat 4 { forward(100); right(90) }`.
3. Naming things: `let foo <- 42`. (More on that arrow in a bit.) Although the first things that many people will name are functions (with parameters, even!): 
   1. `to square :side / repeat 4 [forward :side right 90 / end]`, or
   2. `fn square (side) -> repeat 4 { forward(side); right(90) }`, or, less obviously, 
   3. `let square <- f((side) -> repeat 4 { forward(side); right(90) })`.
4. Questions already arise: why is `repeat` different from `forward`? (I mean, it doesn't have to be, `repeat(4, {forward(100); right(90)}))` is plausible--although it would have to be a special form/macro, since it needs the passed block unevaluated. Or you can do what dirty turtle does and use a lambda: `repeat(4, f(() -> {forward(100); right(90)}))`, but (a) lots of parens, and (b) `let` is already different. (I mean, it doesn't have to be: `(let (foo 42) ...)` in Lisp...). Meaning that we're already learning about different kinds of things: numbers, functions, and keywords. Syntax!
5. Logo people like recursion, too, as a control flow. Handling unterminated recursion is going to be a thing: `fn square (side) -> { forward(side); right(90); square(side) }`. Recursion is great! The emphasis on recursive thinking also feels very much of its time. (And that's a good thing to notice!) But especially with tail call optimization, if the function is tail recursive (as this is), then we'll need a way to stop that.
6. So far we only have two types: integers and functions of the type `Int -> Nothing`. Let's introduce a third: `pen_color :: Color -> Nothing`. We're going to write that `pen_color(red)`, with `red` being in the global scope. `forward(red)` is a type mismatch! The error message in that message should say just what you need to know. `Type mismatch in forward: I was expecting an Int and you gave me a Color.` (To be sure, this sort of thing can definitely happen with dynamic types.)
7. Next up, terminated recursion, and of course also conditional logic. The question is: do we start with `if` or pattern matching?
8. Other transition points:
   1. From procedures to functions. Do we want to reify this difference? How? (Standard practice is to write proceudres (functions with side-effects) with exclamation points: `forward!(90)`). I don't hate that, but it's a bit silly. (Silly is good, but maybe not in this case? Especially since it would have to propagate: `square!`, `circle!`, etc.)
   2. Working with words (strings! lists!).

This whole section feels uninspired and largely redundant. I've worked through this before. Reading Papert this morning this all felt so alive; now I'm feeling stupid and slow and rote.

The questions are: Where are the seams between abstractions? How can we concretize them? What can the langauge do to make those concretions more tractable (syntonic)?

### Historically-oriented features
* Dynamic scoping. Hard pass.
* `thing` and `make`: let's do better.

## Some examples of what I'm imagining

### First, in staticland
```
// we use arrows instead of = for assignment
// maybe
// this frankly feels more expressive for binding than =
let foo <- 42
let bar <- "twenty-three"

// we might also be able to do
// the parsing is a bit more complex but not much
foo <- 42
bar <- "twenty three"

// a type declaration
type List(a) -> () | (a, List(a))

// note the return type specified here
// any type variables here are in scope in the function
fn cons -> List(a) (
  /// Adds a value to the beginning of a list, value first.
  /// This is a docstring
  // This is a regular comment
  // note inline type declarations
  (x :: a) -> (x, ())
  (x :: a, xs :: List(a)) -> (x, xs)
)

fn conj -> List(a) (
  /// Adds a value to the beginning of the list, list first.
  (xs :: List(a), x :: a) -> (x, xs)
)

fn fst -> a (
  /// Extracts the first element of a tuple.
  // The ... pattern matches the rest of the elements as a list.
  // The _ pattern matches and ignores anything.
  (x :: a, ..._) -> x
)

fn snd -> a (
  /// Extracts the second element of a tuple.
  (_, x :: a, ..._) -> x
)

// you may get nil back
// but it's not a maybe
fn head -> a? (
  () -> ()
  (xs :: List(a)) -> fst(xs)
)

fn tail -> List(a) (
  () -> ()
  (xs :: List(a)) -> snd(xs)
)

fn list -> List(a) (
  (...xs :: List(a)) -> xs
)

// a list literal is [1, 2, 3]

fn fold -> a? (
  // where clauses come at the beginning
  // they introduce types
  where folder :: (b, a) -> b; list :: List(a); accum :: b
  (folder, ()) -> ()
  (folder, list) -> fold(f, head(list), tail(list))
  (folder, accum, ()) -> accum
  (folder, accum, list) -> fold(f(accum, head(list)), tail(list))
)

fn map -> List(b) (
  where mapper :: (a) -> b; list :: List(a)
  (mapper, ()) -> ()
  (mapper, list) -> fold(
    f((xs, x) -> conj(xs, mapper(x))), // should infer lambda types
    (),
    list)
)

fn add -> Number (
  where x :: Number; y :: Number; zs :: List(Number)
  () -> 0
  (x) -> x
  (x, y) -> <<native x + y>>
  (x, y, ...zs) -> fold(add, add(x, y), zs)
)

fn div -> Number (
  where x :: Number, y :: Number
  (x, 0) -> raise "Division by zero!"
  (x, y) -> <<native x / y>>
  (x, y, ...zs) -> {
    let divisor <- fold(mult, y, zs)
    div(x, divisor) // in a block the last expression is the return
  }
)

// placeholder for partial application
map(add(1, _), [1, 2, 3]) //=> [2, 3, 4]
add(1, _)(2) //=> 3

// pipelines yes
// also note placeholder in first position
1 |> add(3, _) |> mult(2, _) |> pow(_, 2) //=> 64

ref position <- (0, 0)
ref heading <- 0

// given from_angle, scale, add_vec

// note the last expression in forward is a statement
// it will not return nil but Nothing
fn forward -> Nothing (
  (distance :: Number) -> {
    let movement <- scale(distance, from_angle(heading))
    swap position <- add_vec(position, movement)
  }
)

```

---
### After some time...
One thing I'm thinking is that static typing really may be too much overhead for learners. The issue I'm thinking through is how to handle hashes/objects/maps. Row polymorphism is great, but I worry that (a) getting PureScript-style row polymorphism means implementing higher-kinded types and thus a really robust but also really complex type system (both to implement and, more importantly, to use), and (b) in PureScript is actually a way of dealing with JavaScript's objects, but inside of Purs, you'd just use a normal struct instead of throwing whatever at a hash and letting the type inference algorithm do the work.

There are intermediate/fallback positions between row polymorphism and dynamic typechecking, but I think the first thing to do might be to see if we can make it fast enough to use dynamic typechecking. It occurs to me that one thing we might be able to do to speed up runtime typechecking is to represent types with integers and use a simple bitmasking operation to determine whether a thing is of a particular type. This could get hairy with lots of types, but if we discourage user-defined types Clojure-style by offering a few common data structures and functions that operate well and easily on them, then we might be able to get away with using a `u8` to represent a type. (A program wouldn't need more than 255 types, I reckon.)

Thus the dynamic pattern-matching on types wouldn't introduce too much overhead (for some definition of "too much," tbd.).

Also: now that I have written a parser from scratch, for language development I'm pretty sure we'll want to use Pest and a PEG to specify the syntax. Until we settle on a syntax, anyway. But I suspect that parsing will not be a bottlneck.