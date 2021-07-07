# `Pred::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `and::fn`
`(x)::(is_fn)`<br/>
`(x, y, ...z)`<br/>
Takes a single function, or a list of two or more functions. With a list of functions, it returns a function that passes its args to each of the list of functions, and returns `true` only if every result is truthy. With a single function, it returns a function that takes a list of functions, and is the `and` of that function and the passed list.

#### `bool::fn`
`(x)`<br/>
Coerces a value to boolean `true` or `false`: returns false if a value is `false` or `undefined`. Otherwise returns true.

#### `has::fn`
`(key)::(is_key)`<br/>
`(key, obj)::(is_key, is_any)`<br/>
Tells if an object has some value set at a particular key. Note that it will return `true` if a particular object has had a key explicitly set to `undefined`. Only tests own properties.

#### `is::fn`
`(type)::()`<br/>
`(type, value)::(, is_any)`<br/>
Tells if a value is of a particular type. Partially applied, it returns a unary function that tests if its argument conforms to type.

#### `is_any::fn`
`(_)`<br/>
Always returns true: could be anything. Otherwise returns false.

#### `is_arr::fn`
`(x)`<br/>
Tells if something is an array.

#### `is_bool::fn`
`(x)`<br/>
Returns true if the value passed is a boolean. Otherwise returns false.

#### `is_coll::fn`
`(x)`<br/>
Tells if something is a collection: an object or anything iterable that is not a string.

#### `is_fn::fn`
`(x)`<br/>
Returns true if the value passed is a function. Otherwise returns false.

#### `is_int::fn`
`(x)`<br/>
Returns true if the value passed is an integer. Otherwise returns false.

#### `is_iter::fn`
`(x)`<br/>
Returns true if the value passed in conforms to the JS iterable protocoP. Otherwise returns false. It does not do this check relentlessly: it returns true if the value has a `function` at `[Symbol.iterator]`.

#### `is_js_obj::fn`
`(x)`<br/>
Returns true if the value passed is an object, according to JavaScript. Otherwise returns false. NB: All collections are objects: object literals, but also arrays, vectors, lists, etc.

#### `is_key::fn`
`(x)`<br/>
Tells if a value is a valid key for a property on an object.

#### `is_num::fn`
`(x)`<br/>
Returns true if the passed value is a number. Otherwise returns false.

#### `is_obj::fn`
`(x)`<br/>
Tells if a value is an object in Ludus. For the most part, this means object literals: it excludes any JS objects that are constructed using `new`. Typed Ludus constructs (e.g., specs, types, lists, and so on) are not objects.

#### `is_sequence::fn`
`(x)`<br/>
Returns true if the value passed in is a sequence: an iterable collection. (Strings are iterable, but they are not sequences.) Otherwise returns false.

#### `is_sequence_of::fn`
`(pred)::(is_fn)`<br/>
`(pred, xs)::(is_fn, is_any)`<br/>
Takes a predicate and a value and returns true if the value is a sequence and each member of the sequence passes the preidcate. (Strings are iterable but not sequences.) Otherwise returns false.

#### `is_some::fn`
`(x)`<br/>
Returns true if the passed value is *not* undefined. Otherwise returns false.

#### `is_str::fn`
`(x)`<br/>
Returns true if the passed value is a string. Otherwise returns false.

#### `is_undef::fn`
`(x)`<br/>
Returns true if the passed value is undefined. Otherwise returns false.

#### `maybe::fn`
`(pred)::(is_fn)`<br/>
Takes a predicate function and returns a predicate function that returns true if the value passed passes the predicate function, or if the value is undefined.

#### `not::fn`
`(pred)::(is_fn)`<br/>
Takes a function, and returns a function that is the negation of its boolean value.

#### `or::fn`
`(x)::(is_fn)`<br/>
`(x, y, ...z)`<br/>
Takes one or more functions. Returns a function that passes its args to each of the list of functions, and returns `true` if any result is truthy.

## Values
