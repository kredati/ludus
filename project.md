# Ludus project management

## Meta
[ ] Develop this further
[ ] Write new thoughts about standalone vs. using libraries

## Milestone: MVP

### Milestone: Prelude
The absolute core constituents of Ludus that are depended on by (nearly) every part of the system. Everything here is written in vanilla JS, or depends only on other parts of `prelude`. Criteria for belonging:

* Relies on JS internals that will not be available in Ludus.
* Is a bedrock dependency for other parts of `prelude`.

[ ] Clean up `core.js`
  [ ] Rename to `prelude.js`
  [ ] Design: what must be in a truly minimal `prelude` (vs. `core`)?
  [ ] Move core fns to new `core.js`
[-] Errors
  [-] `raise`: functional rather than statement-based error throwing
    [*] base implementation
    [ ] add reporting
  [*] `bound`: return errors instead of throwing
  [-] `handle`: wraps a function with a `try`/`catch`
    [*] basic implementation
    [ ] improve this
  [*] `report`: helper function which sends messages to `console.error`
[-] Functions
  [-] Function improvements
    [-] `n_ary`: dispatch on arity
      [*] base implementation
      [ ] design problem: rest args, default args
    [*] `loop`/`recur`: better recursion
    [-] `fn`: basic decorated fns
      [*] base implementation
      [ ] optimize for looping
    [-] `pre_post`
      [*] base implementation: bare predicates
      [-] optimize for good errors: `explain` framework
        [*] implement `explain` multimethod
    [-] `defn`
      [*] base implementation: pass an object
      [ ] allow for environment-based optimizations (REPL vs. production)
      [?] n_ary implementation: vary on arity
      [ ] ensure `loop`/`recur` optimizations
  [-] Function manipulations
    [*] `once`: runs a function only once and then caches the result
    [*] `partial`: partial function application
    [*] `rename`: renames functions; we can't do that without relying on JS
    [ ]
    [-] function combinators
      [ ] investigate: do function combinators belong in `prelude` or `core`?
          [ ] performance considerations: `reduce` vs. `for..of`
          [ ] error handling
      [ ] `pipe`
      [ ] `pipe_some`
[-] Polymorphic dispatch
  [-] Multimethods
    [*] base implementation
    [ ] design metadata
    [ ] pre & post condition testing
    [?] switch on `eq` instead of `===`
        ^ avoid leaky abstractions
        [ ] research `Record` performance
        [ ] research use of HAMTs
  [?] Prototype-based dispatch
    [ ] design research
    [ ] base implementation
[-] Datatypes & type system
  [*] design & implement basic scheme
  [ ] design research: does the basic scheme work?
    [ ] consider `new`/object construction
    [ ] consider `extends` and class hierarchies, incl. `instanceof`
    [ ] condiser prototype-based construction
    [ ] are magic strings enough?
    [ ] can we abstract over prototypes, classes, and magic strings?
[-] Immutable vectors
  [*] basic functionality
  [ ] test harness
  [-] optimization
    [-] `tail`
    [ ] `head`
[ ] Linked lists
  [ ] basic functionality
  [ ] performance optimization: pointers or arrays?
[-] Seqs
  ^ combines JS iteration protocol with a `first`/`rest` protocol
  [*] basic functionality
  [ ] design size/infinity info
  [ ] research: better abstraction over generator functions
[-] Reduce & Transduce
  [*] `reduce` over seqs
    [*] with short-circuiting
  [-] `transduce`
    [*] core functionality
    [ ] ensure completeness
    [ ] devise scheme for mutating `conj`
  [-] prelude transducers
    [ ] identify which tranducers belong in `prelude`
[-] Foundational value operations
  [*] safe `get`
  [*] better booleans
[-] equality testing
  [*] base implementation
  [ ] testing
  [ ] improvement
[ ] References
  [ ] study Clojure references
  [ ] base implementation
[ ] Investigate: reaching the outside world
  [ ] Do we build in IO?
    [ ] `console`
      [ ] `.log`
      [ ] `.error`
      [ ] `.warn`
      [ ] Tied to specific affordances (e.g. node vs. Chrome vs. Firefox)
    [ ] `stdin`, `stdout`, `stderr`
  [ ] Using JS libraries
    [ ] EFI: how to handle calling out to regular JS?
    [ ] Consider `js`: simply skip Ludus parsing and hand it to the host
        ^ How do we make this safe? Maybe we don't.
[ ] Namespaces
  [ ] Basic design
[ ] Comprehensive testing of `prelude` functions

### Milestone: Core
Core is a relatively complete standard library whose constituents are the building blocks of a fuller environment. Also, each of these will be defined with `defn`, including documentation.

[ ] parser combinators
[ ] full set of transducers
  [ ] identify core transducers
[ ] value operations
  [ ] atoms
    [ ] booleans
    [ ] numbers (math)
  [ ] strings
  [ ] collections
    [ ] design collection abstractions
      [ ] any collection
      [ ] seqs / ordered collections 
    [ ] objects
    [ ] arrays/vectors
    [?] sets
    [?] maps
[ ] Seq elaboration
  [ ] seq combinators
  [ ] useful infinite seqs
[ ] Complete set of transducers
[ ] `show`
[ ] `doc`
[ ] Comprehensive testing of `core` functions

### Milestone: Language design
See [./nodes_and_research/language.md].

Special forms:
[ ] `when` + ternary operator
[ ] `cond` + compilation
[ ] `js` + no parsing

### Milestone: Ludus Parser
TBD

### Milestone: node REPL
[ ] Node-native REPL

## Milestone: Full prototype
[ ] Built-in testing
  [ ] Adapt somebody else's testing framework?
  [ ] Build our own?
[ ] Web APIs
[ ] Graphics
[ ] Sentence/word/string manipulations
[ ] Better errors
[ ] Basic documentation
  [ ] Auto-generated documentation for GitHub
  [ ] Introduction for programmers

## Milestone: Improvements
[ ] LSP/Code integration
  [ ] Base LSP implementation
  [ ] REPL plugin for VS Code
[ ] Web server/HTTP
[ ] Performance tuning
[ ] Bugfinding & -fixing
[ ] Language/environment feedback
[ ] Identify more nice-to-haves
[ ] Documentation for beginners