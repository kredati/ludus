# Notes on functions
## Design, research, desires

### clj's `fn`
From `(doc fn)`:
```
cljs.core/fn
   (fn name? [params*] exprs*)
   (fn name? ([params*] exprs*) +)
Macro
  params => positional-params* , or positional-params* & next-param
  positional-param => binding-form
  next-param => binding-form
  name => symbol

  Defines a function
```

### clj's `defn`
From `(doc defn)`:
```
cljs.core/defn
([name doc-string? attr-map? [params*] prepost-map? body] [name doc-string? attr-map? ([params*] prepost-map? body) + attr-map?])
Macro
  Same as (def name (core/fn [params* ] exprs*)) or (def
    name (core/fn ([params* ] exprs*)+)) with any doc-string or attrs added
    to the var metadata. prepost-map defines a map with optional keys
    :pre and :post that contain collections of pre or post conditions.
```

### What do I want
* A name
* A docstring
* Optional argument & return checks (clj's `:pre` and `:post` + spec)
* Bells and whistles added to make functions better:
  - n-ary function dispatch
  - `recur` tco (possibly with `defrec` to avoid unnecessary indirection?)
  - arbitrary metadata
  - more elegant error handling
* Both object-based (named, arbitrary order) and argument-based (unnamed, specific order) function definition
  - Usefully, `defn` will take a map as a single argument, and the most basic call with unnamed, ordered arguments will be binary (`name`, `body`).
* That means we need the following fields:
  - `name` (optional), string
  - `doc` (optional), string
  - `meta` (optional), object: fields from this are merged onto the function
  - `pre`, either:
    * a single predicate function
    * or, an array of predicate functions
    * each function gets the same arguments as the function invocation
  - `post`, as `pre`, but each function gets the return value
  - `body`, either:
    * a single function
    * an array of functions (with different arities)
  - **except**, we need pre and post for each different body function, since different arities require different `pre` and `post` predicates.
  - also: we will probably want a specific shorthand for argument-checking in addition to `pre` and `post`, e.g. `takes` and `returns`.
* 
