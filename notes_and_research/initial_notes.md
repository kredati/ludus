# Some deep thoughts on Clojurific JavaScript

### Some basic design notes
* **Do your best to keep everything as simple as possible, and then compose.** This is lispish, and important. The idea is not to create monoliths with tight integration. In particular, this cuts against the grain of a static typing system. That said, the ordering of the pieces may be important. More on this below.
* **The runtime is important at every stage of design.** Static functional typesystems try to push everything towards the compiler. There's overhead in keeping everything around at runtime, but for learners and REPL-driven-developers, keeping the runtime aware of (most) everything is important.
* **Speed considerations are to be mitigated, not avoided.** A lot of this is about being fast _enough_; I have a lot of design work to get from here to where I'm troubleshooting the speed limitations of animation loops. For example, it will be impossible to get JavaScript to use immutable data structures with literal objects & arrays, but you can get a lot of the way towards making pure-functional transformations of those datastructures performant (enough) using transducers and generators.
* **Speed considerations can be mitigated throgh runtime manipulations.** One thing worth noting is that much of the speed difficulty in the full environment (especially but not only runtime type checking, as opposed to a much more difficult & complected attempt at static type inference and checking) can be managed through clever (and simple) manipulations of the runtime, including dispatch to different versions of a function based on environment variables.
* **First things first.** Interestingly, the static type system impulse leads you to try to get the type system right first. The lispish approach, however, actually leads to a different set of foundations: the manipulation of functions. I have discovered in the few days I've been working on this that function manipulation and good error handling are at the absolute core. (The good error handling is, of course, my own consideration.)
* **Polymorphism is important.** Runtime polymorphic dispatch is slow, but it also ends up being a primary design consideration here. Because JS's polymorphic dispatch system is a damn mess of special cases and inconsistent abstractions, and it requires the use of methods, we have to bootstrap our own scheme. This will take quite a lot of time to get right. I believe the best approach (for now) will be to mimic Clojure's multimethods; protocols will be harder. (And possibly unnecessary to start with; multimethods are simple, protocols less so.)
* **Use the host platform's polymorphic dispatch system.** It's likely faster than anything I can invent myself. cf. Rich Hickey's "History of Clojure," where part of the desideratum of the host system is fast runtime polymorphic dispatch. (This goes on the backburner: as it turns out, functional dispatch with multimethods is _much_ simpler, and something like fast enough.)
* **Much of what is done in Clojure with macros can be accomplished using function composition.** This is not so surprising, but instead of manipulating code-as-data, we can use functions to get a lot of the way there. (It's frequently not as performant, but: meh.)
* **Simplicity is key to building out a core.** Clojure has a great many small, specific functions. (To wit: consider many different versions of function composition.) This may be difficult for a beginner to master, but it's worth developing the ergonomics of beginner interaction only once the environment is fully built out.
* **Keep in mind Clojure's version of simplicity: 100 functions that work on a single abstraction.** One reason polymorphic dispatch is so important is for a Clojurish (and, by extension, Logoish) environment is that we want a standard set of functions to work against a set of common abstractions. JavaScript done screwed this up, since not all values work with this. But with multimethods and the use of our basic types (array, object/record, set, list, map), as well as spec, you can get very good error messages at runtime without algebraic data types, OO-style inheritance, etc.
* **Where possible and/or desirable, mirror the semantics of Clojure, or ones that can easily translate to Clojure.** The pattern I'm anticipating, ultimately, is a compiler which (this is stupid, but bear with me) compiles Ludus (which is JavaScript) into ClojureScript, which then recompiles into JavaScript. The first iteration is actually going to be fully in JS, to see if that's fast enough. The idea here is that parts of Clojure(Script) are very close to the semantics of Logo, and, similarly, parts of JavaScript can also be made to get close. But Clojure(Script) has the advantage of having fast immutable data structures, very good optimization on other fronts, and a library ecosystem that is mostly purely functional (so, for example, I may not need to rely on p5.js but rather on cljs canvas libraries). It may not be necessary, ultimately (more on that later), but it's a good goal to have in mind while building out the JS environment.
* **Do some careful research.** The ACM histories of Logo and Clojure will be very useful in this regard. In place of experimentation & play as design work (what I've been doing for the past couple of years), there's a moment here to get pretty rigorous about the language design. Those are the places to start.
* **When in doubt, use plain old data structures and functions.** This is Clojurish and Logoish: Clojure is bolted onto an object-oriented host system (in Java or JavaScript), but Logo has no idea of objects. More to the point, it is oriented towards good intuitions around functions and simple data structures. Clojure's most idiomatic expressions lie in function composition rather than its OO host system. (Although it may rely on that host system for speed, which is a secondary concern for Ludus.) What that means, though, is that everything should be dead simple.
* **Do the best to make Ludus code data.** Clojure's Lisp inheritance, as well as Logo's, mean that the code-is-data homoiconicity is a good regulative ideal. That won't necessarily mean code is fully data, because JS means it can't be homoiconic (and Lisp's parens really are a problem for learners, I reckon), but it does mean that a great many things might be modified at runtime, and having good tools for that will be useful.
* **Spec will be very important to get right.** Clojure's spec is an extremely interesting/powerful way of doing data validation. And because code is data, it is also useful for code validation. But modeling Ludus's spec on Clojure's will make it possible to do really sophisticated validations, which will make it possible to have very good errors.
* **Spec will want to play nicely with parser combinators.** Spec and parser combinators are closely related. It will be very useful indeed to see if they can't be made to conform to a similar API--or better yet, share an abstraction.
* **Transducers will have to come before spec.** The full-on version of spec will have to rely on transducers to do some of its more sophisticated work (e.g. the zero-or-many, or one-or-many matches that don't come at the end of a list). That said, it may well be possible to develop a good-enough version of spec without transducers. The tough bit is what counts as "good enough."
* **State management will be important.** Unlike Logo, most everything will be pure stateless functions. This is actually a good thing! But robust and easy-to-grok state management will be key. The solution to this is likely to be an explicit state construct, like Clojure's refs & atoms. Ludus will allow more than one, but SOP will be to have a single state object and then an Elmish/Redux-ish set of functions. (This will be important for Kredati.)
* **Ludus/JS and/or Ludus/clj(s) interop will be crucial.** The idea here is that it should be posisble to hook into the broader package ecosystems will minimal fuss. To be sure, that means package managers! Which, meh. But it will be useful for Ludus to be able to talk to a wider universe of functionality than what it in the standard library.
* **The standard library should be comprehensive for the core Ludus use-cases.** What will learners want to do with Ludus? Get a sense of that, and then work from there. My imagination is limited, so it will mean bringing this to other people and getting their input early and often. What could you imagine doing with this? And then do it. (But also: what do I imagine doing with it? --This is one area for research.)
* **Pay particular attention to impedence mismatches.** JavaScript's warts are especially warty. I know how to work around them using JS, but it is best if Ludus users/learners never have to. The three that come to mind that will be hardest to work around are: the utter stupidity of both `null` and `undefined`; and the boolean coercion function, which comes back `false` for `null`, `undefined`, `0`, and `''`--falsy values should be `false` and `null` and that's it (or perhaps `undefined`); and (ugh) recursion. The first and last will be the tougher lifts. (Clojure largely punts on this score, although it's easy enough to get something like loop/recur working in JS; Ludus cannot, since recursive calls are a foundational concept and control structure, which is going to be... interesting to solve.)
* **Pay particular attention to conceptual leaps and shifts.** One of the most important conceptual shifts in Logo is from relative polar geometry (often called 'turtle' geometry, although that's a bit of a misnomer) to Cartesian geometry. One of the reasons I like the boids simulation is that it's an elaboration of turtle geometry. Which is to say: the lessons should be carefully tailored to developing not only ladders of abstraction but paths of conceptual elaboration (more than one, but countably many), and the language and environment should be opinionated about how those go.
* **The REPL will be very important.** Ludus should have its own REPL. REPLs aren't hard (especially with generators--and also for VSCode-integrated REPL like JSRepl), but that will mean developing models for IO early and robustly.
* **Namespaces, modules, and all that.** I still (as of July 23, 2020) don't fully grok Clojure's namespaces. I believe that JS's limitations will mean I'm stuck with the ES modules. That's fine, I think. But breaking things into modules will be helpful for some kinds of optimization.
* **Minimize reliance on external dependencies.** Every dependency is a pet, which needs to be kept updated. The less I rely on dependencies (especially those in the high-churn JS ecosystem), the more I have to stay on top of keeping things up to date. A lot of this should be very simple, and so shouldn't have to be subject to churn.

### Next steps
[ ] Error handling
  [ ] List user-driven errors: what errors are beginners likely to make?
  [ ] List system-driven errors: what errors does the system invite?
  [ ] Develop a logic for dealing with errors, starting with JS's built-ins.
    [ ] Develop a strategy for stack and other tracing.
  [ ] Consider alternatives to JS's built-ins, including call/cc.
  [ ] Research Logo's error handling & messages.
[.] Function composition and manipulation
  [x] Develop a core set of function combinators.
  [ ] Develop a strategy & fns for function annotation and decoration.
    [ ] Decorate already-existing functions
    [ ] Definition functions
  [ ] Develop a strategy for multiple dispatch
    [x] Dispatch on arity
    [ ] Dispatch on function (multimethods)
    [?] Investigate/consider protocols & faster OO-based dispatch
[ ] Core library on scalars
  [ ] Bools
  [ ] Nums
  [ ] Strs (although are Strs actually sequences?)
  [ ] Symbols
[ ] Seqs, colls, transducers: functions over collections
  [ ] Finalize seq
  [ ] Develop coll
  [ ] Write basic transducer scheme
  [ ] Write core seq/coll fns
[ ] Control flow
  [ ] Develop a loop/recur construct
  [ ] Develop tools for handling recursion well, including unterminated recursion
  [ ] cond
  [ ] match --if it's necessary with multimethods, or possible w/o ADTs
[ ] Spec
[ ] Parser combinators
  [ ] CSV parser
  [ ] JSON parser
  [ ] Ludus parser
    [ ] Define Ludus grammar
    [ ] Implement Ludus grammar
  [ ] Markdown parser
[ ] State management
  [ ] Investigate more thoroughly clj's atoms, etc. ([cf](https://www.braveclojure.com/zombie-metaphysics))
  [ ] Develop constructs for mutable state
[ ] Environments
  [ ] Devise various levels of protection & error handling
  [ ] Node vs. browser
[ ] Text handling
  [ ] Research Logo text handling
  [ ] Words & sentences
  [?] Regxps
  [?] Easier parser APIs
  [ ] path handling
    [ ] file
    [ ] http(s)
[ ] IO
  [ ] stdin & stdout
  [ ] file-based slurp & spit
  [ ] eval
    [ ] Research eval/Function(), etc.
    [ ] Ludus -> JS
    [?] Ludus -> CLJS
  [ ] modules and namespaces
  [ ] REPL
    [ ] Node.js-based REPL (_not_ an actual node REPL)
    [ ] _Very_ simple browser-based REPL
  [ ] Browser interaction
    [ ] canvas
      [ ] wrapper around p5.js
      [?] research optimizations, other libs, roll my own
    [ ] HTML/DOM
      [ ] basic declarative html
        [ ] research Hyperscript & Hyperaxe
        [ ] wrap or adapt
    [ ] user interaction
      [ ] wrapper around p5.js
      [?] research optimizations, other libs, roll my own
  [ ] http
    [ ] make http requests
    [ ] host an http server
[ ] JS interop
  [ ] Functions to do annoying stateful things
    [ ] new
    [ ] classes/extends/prototypes
[ ] Conventions for interactive apps
  [ ] Elmish/Redux pattern?
[ ] Databases?
  [ ] Consider [datascript](https://github.com/tonsky/datascript)
      ^- It's for both cljs and js!, and is so much easier than SQL
      ^- It's in memory, but [can be serialized apparently simply](https://github.com/tonsky/datascript/wiki/Tips-&-tricks)

