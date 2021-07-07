# `Flow::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `always::fn`
`()`<br/>
`always` always returns true.

#### `cond::fn`
`(value, ...clauses)`<br/>
`cond` takes value and a series of clauses (at least one). Each clause is an array of two items, a predicate function and an executive function. If the predicate returns a truthy value when passed to the predicate, the executive function is called with the predicate. Note that both predicate and executive functions must be unary. E.g. `cond(1, [eq(0), inc(1)], [eq(1), inc(2)]); //=> 3`.

#### `fcond::fn`
`(...clauses)`<br/>
`fcond` takes a series of clauses, and returns a unary function that passes its value to the clauses, as `cond`.

#### `just::fn`
`(x)`<br/>
Takes a value and returns a function that returns that value when called. (Also known as a `thunk`.)

#### `repeat::fn`
`(count, fn)::(is_int, is_fn)`<br/>
Takes a number, `count`, and a function with side effects. Calls that function `count` times, passing the `count` into the function as an argument. Returns the result of the last call. Note that this is eager; for lazy evaluation, use `Lazy.repeatedly`.

#### `when::fn`
`(x)`<br/>
`when` is the core conditional form of Ludus. It is like a normal function (and the function part behaves exactly as `bool`), but it must be followed by two conditional expressions: `when({condition}) ? {if_true} : {if_false}`. Unlike other Ludus conditional forms, the `{if_true}` and `{if_false}` expressions are only executed when the condition passed to `when` is, respectively, `truthy` and `falsy`.

## Values
`clause`