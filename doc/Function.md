# `Function::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `and::fn`
`(x)::(is_fn)`<br/>
`(x, y, ...z)`<br/>
Takes a single function, or a list of two or more functions. With a list of functions, it returns a function that passes its args to each of the list of functions, and returns `true` only if every result is truthy. With a single function, it returns a function that takes a list of functions, and is the `and` of that function and the passed list.

#### `ap::fn`
`([fn, ...args])::(is_sequence)`<br/>
Takes a sequence with the function in the first position and its arguments after, and applies the arguments to that function.

#### `apply::fn`
`(fn, args)::(is_fn, is_sequence)`<br/>
Takes a function and a sequence of arguments and calls the fucntion with that sequence of arguments.

#### `call::fn`
`(fn, ...args)::(is_fn)`<br/>
Takes a function and a set of arguments--as arguments--and calls the function with those arguments.

#### `comp::fn`
`(...fns)`<br/>
Composes functions, e.g. `comp(f, g)` is the same as `f(g(x))`. In other words, it builds a pipeline in reverse.

#### `comp_some::fn`
`(...fns)`<br/>
Composes functions, as `comp`, but short-circuits on the first `undefined` value.

#### `fn::fn`
`(...args)`<br/>
#### `fn::fn`
`(...args)`<br/>
#### `id::fn`
`(x)`<br/>
Handy function that simply returns its argument unchanged.

#### `just::fn`
`(x)`<br/>
Handy function that "thunkifies" its argument: it returns a nullary function that will simply return its argument.

#### `loop::fn`
`(fn, max_iter = 1000000)::(is_fn)`<br/>
Takes a function that is in tail-recursive form and eliminates tail calls, if the recursive calls are made using `recur` instead of the function name. Also allows for looping of anonymous functions.

#### `method::fn`
`({name, not_found, ...attrs})::(method_descriptor)`<br/>


#### `n_ary::fn`
`(name, ...clauses)`<br/>
#### `not::fn`
`(pred)::(is_fn)`<br/>
Takes a function, and returns a function that is the negation of its boolean value.

#### `once::fn`
`(fn)::(is_fn)`<br/>
A function wrapped in `once` is run once, caches its result, and returns that result forever. It is useful for managing stateful constructs in a purely functional environment. (E.g., it is used in a crucial place in './seqs.js' to make iterators "stateless.")

#### `or::fn`
`(x)::(is_fn)`<br/>
`(x, y, ...z)`<br/>
Takes one or more functions. Returns a function that passes its args to each of the list of functions, and returns `true` if any result is truthy.

#### `partial::fn`
`(fn, ...args)`<br/>
Partially applies a function. Takes a function and at least one argument to apply against the function when subsequent arguments are specified.

#### `pipe::fn`
`(...fns)`<br/>
Creates a pipeline of unary functions, returning a unary function. Passes the argument to the first function, and then passes the return value of the first to the second function, and so on. The first value must not be undefined. Handles errors reasonably gracefully.

#### `pipe_some::fn`
`(...fns)`<br/>
Builds a function pipeline, as `pipe`, but short-circuits on the first undefined return value, and returns undefined.

#### `pre_post::fn`
`(pre, post, body)`<br/>
#### `recur::fn`
`(...args)`<br/>
#### `rename::fn`
`(name, fn)::(is_str, is_fn)`<br/>


#### `show::fn`
`(f)::(is_fn)`<br/>


#### `thread::fn`
`(value, ...fns)`<br/>
`thread`s a value through a series of functions, i.e. the value is passed to the first function, the return value is then passed ot the second,then the third, etc. Each fn must have an arity of 1. The passed value must not be `undefined`.

#### `thread_some::fn`
`(value, ...fns)`<br/>
As `thread`, threading a value through a series of functions, but short-circuits on the first `undefined` return value, and returns `undefined`.

#### `thunk::fn`
`(fn, ...args)::(is_fn)`<br/>
Represents a deferred computation: takes a function and a set of arguments and returns a nullary function that will apply the arguments to that function when it is called.

## Values
`t`