# Ludus project management

## Meta
[ ] Develop this further
[ ] Write new thoughts about standalone vs. using libraries
[ ] Clean this up!--May 2021
[ ] Clean up notes and research folder; remove cruft

### Project key
* `[ ]`: To do
* `[*]`: Done
* `[-]`: In progress
* `[.]`: Deferred
* `[x]`: Declined
* `[?]`: Under deliberation, or needs research

## Milestone: MVP

### Milestone: Prelude
The absolute core constituents of Ludus that are depended on by (nearly) every part of the system. Everything here is written in vanilla JS, or depends only on other parts of `prelude`. Criteria for belonging:

* Relies on JS internals that will not be available in Ludus.
* Is a bedrock dependency for other parts of `prelude`.

`prelude` is itself broken into two stages: unsigned and signed. The unsigned portion of `prelude` involves only what we need to get to signing of function arguments. The `signed` portion is everything else, and uses `defn` and `pre` (&c.) to sign all its functions.

[-] Clean up `core.js`
  [x] Rename to `prelude.js`
  [*] Rename to `base.js`
  [-] Move to `prelude` directory of modules
    [*] Environments
    [*] Errors
      [*] change language from "throw" to "raise"
    [*] Namespaces
      [-] research namespace/type parsing situation: can we enforce dot-access property only on 
    [*] Refs
    [-] Functions
      [ ] revise core function instrumentation
        [ ] improve errors
          [?] throw strings
          [ ] change language from "throw" to "raise"
        [.] devise optimization scheme for different environments
        [?] `pre_post` scheme -> `args`
          [ ] research: do we only want argument typechecking?
          [ ] rewrite all the `defn`ed functions in `prelude` (ugh)
    [x] HashMap
    [*] Methods
    [*] Predicates
    [*] Equality
    [*] List
    [*] ~~Vector~~ Array
    [*] Seqs
    [-] Ducers
    [*] Values
        ^ `prelude` value functions are the things that require operations not available in Ludus, i.e. infix operations (dot property access, addition, boolean and, etc.)
  [*] Design: what must be in a truly minimal `prelude` (vs. `core`)?
  [ ] Develop testing harness for `prelude`
  [*] Move core fns to new `core`
[-] Errors
  [-] `raise`: functional rather than statement-based error throwing
    [*] base implementation
    [*] add `report`ing
  [*] `bound`: return errors instead of throwing
  [*] `handle`: wraps a function with a `try`/`catch`
    [*] basic implementation
    [.] improve messaging
  [*] `report`: helper function which sends messages to `console.error`
[-] Functions
  [-] Function improvements
    [*] `n_ary`: dispatch on arity
      [*] base implementation
      [*] design problem: rest args, default args
    [*] `loop`/`recur`: better recursion
    [*] `fn`: basic decorated fns
      [*] base implementation
      [*] optimize for looping
    [-] `pre_post`
      [*] base implementation: bare predicates
      [-] optimize for good errors: `explain` framework
        [x] implement `explain` multimethod (no multimethods, not yet)
        [x] improve `explain` >>moved to spec<<
    [-] `defn`
      [*] base implementation: pass an object
      [.] allow for environment-based optimizations (REPL vs. production)
      [x] n-ary implementation: vary `defn` on arity :: named fields only
      [*] ensure `loop`/`recur` optimizations
  [-] Function manipulations
    [*] `once`: runs a function only once and then caches the result
    [*] `partial`: partial function application
    [*] `rename`: renames functions; we can't do that without relying on JS
    [*] function combinators
      [*] investigate: do function combinators belong in `prelude` or `core`?
          [x] performance considerations: `reduce` vs. `for..of`
          [*] error handling
      [*] `pipe`
      [*] `pipe_some`
      [*] `thread`
      [*] `thread_some`
      [*] `comp`
      [*] `comp_some`
[-] Polymorphic dispatch
  [x] Multimethods
    [*] base implementation
    [*] design metadata
    [*] pre & post condition testing
    [*] switch on `eq` instead of `===`
        ^ avoid leaky abstractions
        [x] research `Record` performance
        [x] research use of HAMTs
        [*] custom `HashMap` implementation
  [x] Prototype-based dispatch
    [ ] design research
    [ ] base implementation
  [*] Methods
    [*] base implementation
    [-] move from `signed/methods` to `base`
      [*] add the possibility of default behavior if method not found
      [?] improve errors
      [*] `show` in `base`: our first method
    [ ] move protocols from `signed/methods` to `spec`
[-] Datatypes & type system
  [*] design & implement basic scheme
  [*] design research: does the basic scheme work?
    [x] consider `new`/object construction
    [x] consider `extends` and class hierarchies, incl. `instanceof`
    [*] condiser prototype-based construction
    [x] are magic strings enough?
    [x] can we abstract over prototypes, classes, and magic strings?
    [*] implement basic type scheme
[-] Immutable vectors
  [*] basic functionality
  [ ] test harness
  [*] optimization
    [*] `tail`
    [.] `head`
  [*] remove `shift`/`rest`-like functionality
      ^ `first`/`rest` will be provided by the `seq` abstraction
  [ ] clean everything up
[*] Linked lists
  [*] basic functionality
  [x] performance optimization: pointers or arrays?
[*] Seqs
  ^ combines JS iteration protocol with a `first`/`rest` protocol
  [*] basic functionality
  [*] design size/infinity info
  [*] improve abstraction over generator functions
[-] Reduce & Transduce
  [*] `reduce` over seqs
    [*] with short-circuiting
  [*] `transduce`
    [*] core functionality
    [*] ensure completeness
    [*] devise scheme for mutating `conj_`
  [-] prelude transducers
    [ ] identify which tranducers belong in `prelude`
    [ ] complete them!
  [?] consider instrumenting transducers
[*] Foundational value operations
  [*] safe `get`
  [*] better booleans
  [*] all infix operators -> fns
    [*] boolean operators
    [*] number operators
    [*] string operators
[-] equality testing
  [*] base implementation
  [ ] correctness testing
  [ ] improvement
  [ ] performance testing
[*] References
  [*] study Clojure references
  [*] base implementation
[-] Investigate: reaching the outside world
  [*] Do we build in IO?
    [*] `console`
      [*] `.log`
      [*] `.error`
      [*] `.warn`
      [-] Tied to specific affordances (e.g. node vs. Chrome vs. Firefox)
          ^ runtime detection, etc.
    [?] `stdin`
    [?] file access 
  [*] Using JS libraries
    [*] EFI: how to handle calling out to regular JS?
    [*] Consider `js`: simply skip Ludus parsing and hand it to the host.
        ^ this, but we don't need it/can't muster it until we have a parser/interpreter
[-] Environment
  [*] Namespaces
    [*] Basic design
    [*] `def`
  [*] Custom repl printing
  [*] Runtime detection
  [?] Abstraction for IO
[*] settle on/improve `show` default behaviors
  [ ] ramify show throughout `prelude` (esp. in template strings)
[ ] Comprehensive testing of `prelude` functions TODO: THIS

### Milestone: Core
Core is a relatively complete standard library whose constituents are the building blocks of a fuller environment. Also, each of these will be defined with `defn`, including documentation.

[ ] parser combinators
[ ] full set of transducers
  [ ] identify core transducers
[*] value operations (NB: these are in `prelude`, since they require operatoirs)
  [*] atoms
    [*] booleans
    [*] numbers (math)
  [*] strings
  [*] collections
    [*] design collection abstractions
      [*] any collection
      [*] seqs / ordered collections 
    [*] objects
    [*] arrays/vectors
    [x] sets
    [x] maps
[*] Seq elaboration
  [*] seq combinators
  [*] useful infinite seqs
[ ] complete set of transducers
[ ] `doc`
[ ] comprehensive testing of `core` functions
[x] move `list` to `core` from `prelude`

### Milestone: Language design
See [./notes_and_research/language.md].

Special forms:
[*] `when` + ternary operator
[x] `cond` + compilation
[ ] `js` + no parsing
[ ] `ns` + exports

### Milestone: Ludus Parser
[ ] Basic parser
  [ ] core language
  [ ] nice-to-haves
    [ ] destructuring in all the places
    [ ]
[ ] IO
  [ ] file load & save

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