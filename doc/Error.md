# `Error::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `assert::fn`
`(assertion, error)`<br/>
Takes two arguments: an assertion and an error. If the assertion is truthy, returns it. If the assertion is falsy, it `raise`s the error.

***
#### `bound::fn`
`(fn)::(is_fn)`<br/>
Converts a function that raises an error to one that returns any errors.

***
#### `handle::fn`
`(attempt, on_error)::(is_fn, is_fn)`<br/>
Execute a computation, and handle any errors arising from it (presumably gracefully). Takes two functions: `attempt`, a nullary function that includes the computation that might raise an error; and `on_error`, a unary function that receives (and presumably, handles) any errors. If the computation succeeds, returns the return value of `attempt`; if it fails, returns the return value of `on_error`.

***
#### `raise::fn`
`(err, ...msgs)`<br/>
## Values
