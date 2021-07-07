# Ludus global namespace
Everything here is available globally whenever you `import "@ludus/prelude";`.


Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces
####[`Array::ns`](Array.md)<br/>
####[`Boolean::ns`](Boolean.md)<br/>
####[`Ducers::ns`](Ducers.md)<br/>
####[`Error::ns`](Error.md)<br/>
####[`Flow::ns`](Flow.md)<br/>
####[`Function::ns`](Function.md)<br/>
####[`Lazy::ns`](Lazy.md)<br/>
####[`List::ns`](List.md)<br/>
####[`Ludus::ns`](Ludus.md)<br/>
####[`Number::ns`](Number.md)<br/>
####[`Object::ns`](Object.md)<br/>
####[`Pred::ns`](Pred.md)<br/>
####[`Ref::ns`](Ref.md)<br/>
####[`Seq::ns`](Seq.md)<br/>
####[`Spec::ns`](Spec.md)<br/>
####[`String::ns`](String.md)<br/>
####[`namespace::ns`](namespace.md)<br/>
####[`type::ns`](type.md)
## Functions
#### `Creates a `record`: a named collection of specs. Takes a string name and a "map," which contains specs in various fields. Validates all specs by applying them to the corresponding field on the validated value. Essentially, the `and` of each `at` in the map.::fn`
##### in namespace [`Creates a `record`: a named collection of specs`](Creates a `record`: a named collection of specs.md)
`(...args)`<br/>
#### `abs::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Absolute value of a number: how far away from `0` it is on the number line.

#### `acos::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_in_range<-1, 1>)`<br/>
The inverse of `cos`; takes a number between -1 and 1, inclusive.

#### `add::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Adds numbers. With two or more arguments, sums all the arguments together. With one argument, partially applies `add`, returning a function that will add that will sum all its arguments, and then add the first. E.g., `add(1, 2, 3); //=> 6`, and `add(1)(2); //=> 3`.

#### `always::fn`
##### in namespace [`Flow`](Flow.md)
`()`<br/>
`always` always returns true.

#### `and::method`
##### in namespace [`and::method`](and::method.md)


#### `ap::fn`
##### in namespace [`Function`](Function.md)
`([fn, ...args])::(is_sequence)`<br/>
Takes a sequence with the function in the first position and its arguments after, and applies the arguments to that function.

#### `apply::fn`
##### in namespace [`Function`](Function.md)
`(fn, args)::(is_fn, is_sequence)`<br/>
Takes a function and a sequence of arguments and calls the fucntion with that sequence of arguments.

#### `args::fn`
##### in namespace [`args::function`](args::function.md)
`(...args)`<br/>
#### `arr::fn`
##### in namespace [`Array`](Array.md)
`(...values)`<br/>
Takes its list of arguments and returns an array containing the arguments as elements, in order.

#### `asin::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_in_range<-1, 1>)`<br/>
The inverse of `sin`; takes a number between -1 and 1, inclusive.

#### `assert::fn`
##### in namespace [`Error`](Error.md)
`(assertion, error)`<br/>
Takes two arguments: an assertion and an error. If the assertion is truthy, returns it. If the assertion is falsy, it `raise`s the error.

#### `assoc::method`
##### in namespace [`assoc::method`](assoc::method.md)


#### `at::fn`
##### in namespace [`at::function`](at::function.md)
`(...args)`<br/>
#### `atan::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_num)`<br/>
The arctangent of a slope, returning the angle in radians. With one argument, returns the arctangent of the slope expressed in a ratio. To avoid division by zero at vertical lines, the two-argument versiion takes the numerator and denominator. The two-argument version is much more common in typical use.

#### `bool::fn`
##### in namespace [`Boolean`](Boolean.md)
`(x)`<br/>
Coerces a value to boolean `true` or `false`: returns false if a value is `false` or `undefined`. Otherwise returns true.

#### `call::fn`
##### in namespace [`Function`](Function.md)
`(fn, ...args)::(is_fn)`<br/>
Takes a function and a set of arguments--as arguments--and calls the function with those arguments.

#### `capitalize::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Capitalizes the first character of a string, lowercasing the rest. Does not test whether the first character is a letter; if the first character cannot be capitalized, returns the string unharmed.

#### `cat::fn`
##### in namespace [`Ducers`](Ducers.md)
`(rf)`<br/>
A transducer that concatenates the contents of each input, which must be seqable, into the reduction.

#### `cbrt::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Takes the cube root of a number.

#### `ceil::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Ceiling function: rounds up to the next integer, returning integers unchanged. E.g. `ceil(3.1); //=> 4`. The ceiling of negative numbers still rounds "up," i.e. towards zero: `ceil(-2.3); //=> -2`.

#### `chars::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Splits a string into "characters," strings of size 1. Returns an array of "chars." E.g., `chars('abc'); //=> ['a', 'b', 'c']`.

#### `clamp::fn`
##### in namespace [`Number`](Number.md)
`(max)::(is_num)`<br/>
`(min, max)`<br/>
`(min, max, x)`<br/>
`clamp` constrains the range of a number. With one argument, `max`, it returns a function that clamps its argument between `0` and `max`. With two arguments, `min` and `max`, it returns a function that clamps its argument between `min` and `max`. Given three arguments, `min`, `max`, and `x`, it returns the value of `x` clamped between `min` and `max`.

#### `comp::fn`
##### in namespace [`Function`](Function.md)
`(...fns)`<br/>
Composes functions, e.g. `comp(f, g)` is the same as `f(g(x))`. In other words, it builds a pipeline in reverse.

#### `concat::method`
##### in namespace [`concat::method`](concat::method.md)


#### `cond::fn`
##### in namespace [`Flow`](Flow.md)
`(value, ...clauses)`<br/>
`cond` takes value and a series of clauses (at least one). Each clause is an array of two items, a predicate function and an executive function. If the predicate returns a truthy value when passed to the predicate, the executive function is called with the predicate. Note that both predicate and executive functions must be unary. E.g. `cond(1, [eq(0), inc(1)], [eq(1), inc(2)]); //=> 3`.

#### `conj::method`
##### in namespace [`conj::method`](conj::method.md)


#### `context::fn`
##### in namespace [`Ludus`](Ludus.md)
`(ctx)::(is_obj)`<br/>
Globalizes en masse all members of an object at appropriate keys.

#### `cos::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
The cosine of an angle (in radians).

#### `count::fn`
##### in namespace [`Seq`](Seq.md)
`(x)::(is_seqable)`<br/>
Determines the size of a collection.

#### `create::fn`
##### in namespace [`create::function`](create::function.md)
`(...args)`<br/>
#### `cycle::fn`
##### in namespace [`Lazy`](Lazy.md)
`(seqable)::(is_coll)`<br/>
`(size, seqable)::(or<is_int,is_infinity>, is_coll)`<br/>
Creates a lazy, possibly infinite, sequence of values created by cycling through the members of a sequence. E.g., `cycle([1, 2, 3]); //=> 1, 2, 3, 1, 2, 3, 1, 2, ...`. With two arguments, the first argument specifies how many times to execute the cycle.

#### `dec::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Decrements a number by 1.

#### `defspec::fn`
##### in namespace [`defspec::function`](defspec::function.md)
`(...args)`<br/>
#### `deg_to_rad::fn`
##### in namespace [`Number`](Number.md)
`(...args2)`<br/>
Given an angle measurement in degrees, converts it to radians.

#### `deref::fn`
##### in namespace [`Ref`](Ref.md)
`({value})::(is<partial (t:{Ref})>)`<br/>
Gets the value stored in a ref.

#### `dict::fn`
##### in namespace [`dict::function`](dict::function.md)
`(...args)`<br/>
#### `div::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_nonzero)`<br/>
`(x, y, z, ...more)`<br/>
Divides numbers. Given two arguments, divides the first by the second. Given three or more arguments, divides the first by the product of the remaining. Given a single argument, returns `div` partially applied, dividing that first argument by the product of any additional arguments. E.g. `div(1, 2); //=> 0.5`, `div(12, 2, 3); //=> 2`, `div(24)(2, 4); //=> 3`. Raises an error on attempts to divide by zero (i.e. if any arguments but the first are `0`). If you want a function to divide by a particular number, see `div_by`.

#### `div_by::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_nonzero)`<br/>
Given a number, returns a unary function that divides its argument by the original number. E.g. `div_by(2)(10); //=> 5`. Throws an error on attempts to divide by zero (the argument to `div_by` cannot be `0`).

#### `doc::fn`
##### in namespace [`doc::function`](doc::function.md)
`(x)`<br/>
Shows the documentation for a ludus value.

#### `empty::method`
##### in namespace [`empty::method`](empty::method.md)


#### `entries::fn`
##### in namespace [`Object`](Object.md)
`(obj)`<br/>
Returns an array of `[key, value]` pairs for each property on an object. Returns an empty array if the object has no properties. E.g., `entries({a: 1, b: 2}); //=> [ [ 'a', 1 ], [ 'b', 2 ] ]`.

#### `eq::fn`
##### in namespace [`Ludus`](Ludus.md)
`(x)`<br/>
`(x, y)`<br/>
`(x, y, z, ...rest)`<br/>
Are two things the same? This function tries to answer that question.

  

  As you might guess, this algorithm is rather more complex that it might at first sound, and involves assumptions about the nature of things. For the most part, `eq` will give you the answers that you expect. 

  

  For atomic values (string, boolean, number, etc.), it's simple and returns quickly.

  

  For collections, it tries to a few tricks to be fast. When those fail: for associative collections, it tests for equality at each key; for sequential collections, it tests for equality in order. Testing the equality of large and/or nested collections should be done sparingly, since it may be quite slow. If you are testing for changes in an immutable collection (e.g. arrays) you are working with, you may wish to use `is_identical` instead.

#### `every::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Determines if every element of a collection passes a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `every(is_int, [1, 2, "foo"]); //=> false`.

#### `explain::fn`
##### in namespace [`explain::function`](explain::function.md)
`(...args)`<br/>
#### `fcond::fn`
##### in namespace [`Flow`](Flow.md)
`(...clauses)`<br/>
`fcond` takes a series of clauses, and returns a unary function that passes its value to the clauses, as `cond`.

#### `filter::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Applies a filtering function to a collection, keeping only elements that return a truthy value from that function. With two arguments, takes a unary filtering function and a collection, and produces a new collection of that kind that only includes elements that pass the filter. With a single argument, takes a unary filtering function, and returns a filtering transducer. E.g. `filter(lte(3), [1, 2.3, 4.542, 3, -2]); //=> [4.542, 3]

#### `first::fn`
##### in namespace [`Seq`](Seq.md)
`(coll)::(is_seqable)`<br/>
Gets the first element of any `seq`able.

#### `flatten::fn`
##### in namespace [`Seq`](Seq.md)
`(seqs)`<br/>
`(xform, seqs)`<br/>
Takes any nested combination of sequences and returns their contents as a single, flat, lazy sequence.

#### `floor::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Floor function: rounds down to the next integer, returning integers unchanged. E.g. `floor(3.1); //=> 3`. The `floor` of negative numbers still rounds "down," i.e. away from zero: `floor(-2.3); //=> -3`. Compare to `trunc`.

#### `fn::fn`
##### in namespace [`fn::function`](fn::function.md)
`(...args)`<br/>
#### `forward::fn`
##### in namespace [`Ref`](Ref.md)
`(name)::(is_str)`<br/>
Creates a forward reference. Allows declaration of a function before its definition. Returns a tuple with the function and a setter function. Note that the setter function may only be called once (subsequent invocations will do nothing).

#### `fourth::fn`
##### in namespace [`Seq`](Seq.md)
`(...args2)`<br/>
Gets the fourth element of any `seq`able.

#### `from::fn`
##### in namespace [`String`](String.md)
`(iter)::(or<is_iter, is_undef>)`<br/>
`(iter, separator)::(or<is_iter, is_undef>, is_str)`<br/>
Produces a string from any iterable. Takes an optional separator argument.

#### `future::fn`
##### in namespace [`Ref`](Ref.md)
`(fn)::(is_fn)`<br/>
`(fn, args)::(is_fn, is_arr)`<br/>
`(fn, args, delay)::(is_fn, is_arr, is_int)`<br/>
Schedules a function call in the future.

#### `get::fn`
##### in namespace [`Object`](Object.md)
`(key)::(is_key)`<br/>
`(key, obj)::(is_key, is_any)`<br/>
`(key, obj, not_found)::(is_key, is_any, is_some)`<br/>
Gets the value stored at a particular key in an object. Returns `undefined` if value is not found. It returns `undefined` when looking for a property on anything that cannot have properties: e.g., `undefined`, booleans, and numbers. Given an indexed value (arrays, but also strings) it returns the value at the corresponding index. Returns only own properties. To get properties in the prototype chain, or at symbol keys, use `get_`.

#### `get_in::fn`
##### in namespace [`Object`](Object.md)
`(obj, path)::(is_any, seq<is_key>)`<br/>
`(obj, path, not_found)::(is_any, seq<is_key>, is_some)`<br/>
Nested property access. Given a collection, take a path to a particular value represented by a sequence of keys. Returns `undefined` if there is nothing at that path. E.g. `get_in({a: [1, 2, 3]}, ['a', 1]); //=> 2`.

#### `globalize::fn`
##### in namespace [`Ludus`](Ludus.md)
`(id, value)::(is_str, is_any)`<br/>
Globalizes a value at a particular identifier.

#### `gt::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Greater than comparator, `>`. When given two numbers, returns `true` if the first is greater than the second. When given three or more numbers, returns `true` if the numbers are in decreasing order. When given one number, `gt` returns itself partially applied. Note that partial application is meant to be intuitive rather than rigorous: `gt(4)` returns a function that tests if its argument is greater than 4: `gte(4, 3); //=> true`, but `gte(4)(3); //=> false`.

#### `gte::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Greater than or equal comparator, `>=`. With one argument, partially applies itself. With two, returns `true` if the first is greater than or equal to the second. With three or more, returns `true` if the numbers are in decreasing or flat order, e.g. `gte(3, 2, 1, 1, 1); //=> true`. Note that partial application is meant to be intuitive rather than rigorous: `gte(4)` returns a function that tests if its argument is greater than or equal to 4: `gte(4, 3); //=> true`, but `lte(4)(3); //=> false`.

#### `handle::fn`
##### in namespace [`Error`](Error.md)
`(attempt, on_error)::(is_fn, is_fn)`<br/>
Execute a computation, and handle any errors arising from it (presumably gracefully). Takes two functions: `attempt`, a nullary function that includes the computation that might raise an error; and `on_error`, a unary function that receives (and presumably, handles) any errors. If the computation succeeds, returns the return value of `attempt`; if it fails, returns the return value of `on_error`.

#### `hypot::fn`
##### in namespace [`Number`](Number.md)
`(...xs)`<br/>
Returns the "hypoteneuse" of a list of numbers: the square root of the sum of their squares. This will calculate the distance between the origin and a point in n-dimensional space (where n is the number of arguments passed in). Note that this can be slow, and to compare, e.g. the magnitude of vectors, you should probably use `sum_of_squares`.

#### `id::fn`
##### in namespace [`Function`](Function.md)
`(x)`<br/>
Handy function that simply returns its argument unchanged.

#### `inc::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Increments a number by 1.

#### `index_of::method`
##### in namespace [`index_of::method`](index_of::method.md)


#### `into::fn`
##### in namespace [`Seq`](Seq.md)
`(to, from)::(is_coll, is_seqable)`<br/>
`(to, xform, from)::(is_coll, is_fn, is_seqable)`<br/>
Takes the contents of a seqable and puts them into a collection (NB: the first argument to `into` may not be a string). Takes an optional transducer.

#### `is::fn`
##### in namespace [`is::function`](is::function.md)
`(...args)`<br/>
#### `is_any::fn`
##### in namespace [`Pred`](Pred.md)
`(_)`<br/>
Always returns true: could be anything. Otherwise returns false.

#### `is_arr::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Tells if something is an array.

#### `is_between::fn`
##### in namespace [`Number`](Number.md)
`(x, y)::(is_num, is_num)`<br/>
Tells if a number lies between two numbers, exclusive of the two numbers, with the first number being the lesser of the two. If the first argument is not less than the second, will always return false.

#### `is_bool::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed is a boolean. Otherwise returns false.

#### `is_char::fn`
##### in namespace [`String`](String.md)
`(x)`<br/>
Tells if something is a char, i.e. a string of length 1. Returns false if the input is not a string.

#### `is_empty::fn`
##### in namespace [`Seq`](Seq.md)
`(coll)::(is_seqable)`<br/>
Tells if a seqable is empty.

#### `is_even::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is even. Returns `false` for non-numbers.

#### `is_fn::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed is a function. Otherwise returns false.

#### `is_identical::fn`
##### in namespace [`Ludus`](Ludus.md)
`(x)`<br/>
`(x, y)`<br/>
`(x, y, z, ...rest)`<br/>
Returns true if two values are reference-identical (JS `===`). This is a much faster operation than `eq`, but may give unintuitive answers. `is_identical([1, 2, 3], [1, 2, 3]); //=> false`.

#### `is_in_range::fn`
##### in namespace [`Number`](Number.md)
`(x, y)::(is_num, is_num)`<br/>
Tells if a number is in the range described by the two numbers, inclusive of the two numbers, with the first number being the lesser of the two. If the first argument is not lte than the second, will always return false.

#### `is_index::fn`
##### in namespace [`Array`](Array.md)
`(index)`<br/>
Tells whether something is a valid index of an array.

#### `is_infinity::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tests if something is Infinity.

#### `is_int::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed is an integer. Otherwise returns false.

#### `is_iter::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed in conforms to the JS iterable protocoP. Otherwise returns false. It does not do this check relentlessly: it returns true if the value has a `function` at `[Symbol.iterator]`.

#### `is_js_obj::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed is an object, according to JavaScript. Otherwise returns false. NB: All collections are objects: object literals, but also arrays, vectors, lists, etc.

#### `is_key::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Tells if a value is a valid key for a property on an object.

#### `is_natural::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is a "natural number": integers greater than or equal to `0`. Returns `false` for non-numbers.

#### `is_negative::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is less than zero. Returns `false` for non-numbers.

#### `is_nonzero::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is not zero. Returns false given non-numbers.

#### `is_ns::fn`
##### in namespace [`is_ns::function`](is_ns::function.md)
`(...args)`<br/>
#### `is_num::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the passed value is a number. Otherwise returns false.

#### `is_obj::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Tells if a value is an object in Ludus. For the most part, this means object literals: it excludes any JS objects that are constructed using `new`. Typed Ludus constructs (e.g., specs, types, lists, and so on) are not objects.

#### `is_odd::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is odd. Returns `false` for non-numbers.

#### `is_positive::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is positive, i.e. greater than `0`. Note that `0` is not itself positive. Returns `false` for non-numbers.

#### `is_positive_int::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Tells if a number is a positive integer, i.e. an integer greater than `0`. Returns `false` for non-numbers.

#### `is_seq::fn`
##### in namespace [`Seq`](Seq.md)
`(x)`<br/>
Tells if something is a `seq`. Note that this means it is an actual instance of `seq`--lazy and abstract--and not something that is seqable. For that, use `is_seqable`.

#### `is_sequence::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the value passed in is a sequence: an iterable collection. (Strings are iterable, but they are not sequences.) Otherwise returns false.

#### `is_some::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the passed value is *not* undefined. Otherwise returns false.

#### `is_spec::fn`
##### in namespace [`is_spec::function`](is_spec::function.md)
`(...args)`<br/>
#### `is_str::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the passed value is a string. Otherwise returns false.

#### `is_undef::fn`
##### in namespace [`Pred`](Pred.md)
`(x)`<br/>
Returns true if the passed value is undefined. Otherwise returns false.

#### `is_valid::fn`
##### in namespace [`is_valid::function`](is_valid::function.md)
`(...args)`<br/>
#### `iterate::fn`
##### in namespace [`iterate::function`](iterate::function.md)
`(first, ...rest)`<br/>
#### `join_with::fn`
##### in namespace [`String`](String.md)
`(separator)::(is_str)`<br/>
`(separator, iter)::(is_str, or<is_iter, is_undef>)`<br/>
Produces a string from any iterable, separator first.

#### `just::fn`
##### in namespace [`Function`](Function.md)
`(x)`<br/>
Handy function that "thunkifies" its argument: it returns a nullary function that will simply return its argument.

#### `keep::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Filters a collection by taking a function, `f`, removing any element, `x`, where `f(x)` evaluates to `undefined`. With two arguments, takes a keeping function and a collection, and returns a collection of the same type with `undefined` elements removed. With a single arguemnt, returns a transducer. E.g. `keep(id, [1, undefined, 4, undefined, 6]; //=> [1, 4, 6]

#### `keys::fn`
##### in namespace [`Object`](Object.md)
`(obj)`<br/>
Returns an array of an object's keys. Returns an empty array if the object has no properties.

#### `lazy::fn`
##### in namespace [`Lazy`](Lazy.md)
`(init, step, done)::(is_any, is_fn, is_fn)`<br/>
`(init, step, done, map)::(is_any, is_fn, is_fn, is_fn)`<br/>
Creates a lazy, possibly infinite, sequence. It takes an `init`ial value, two or three unary functions: `step`, `done`, and, optionally, `map`. `step` should return the series of values, first by taking the `init` value, and then, the previous value. `done` should return `true` once the sequence should terminate. `map` is optionally applied to the value before it is yielded into the sequence. It is useful if your lazy sequence needs to keep track of state that is more complex than the values you wish to appear in the sequence.

#### `lerp::fn`
##### in namespace [`Number`](Number.md)
`(stop)::(is_num)`<br/>
`(start, stop)`<br/>
`(start, stop, ratio)`<br/>
Linear interpolatiion between two values. Given a `start` value, a `stop` value, and a `ratio`, calculates the number that is the ratio of the difference between them. E.g., `lerp(0, 4, 0.75); //=> 3`.

#### `list::fn`
##### in namespace [`List`](List.md)
`(...elements)`<br/>
Creates a list of the arguments, in order. E.g., `list(1, 2, 3); //=> ( 1, 2, 3 )`.

#### `ln::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_positive)`<br/>
Natural log, `ln`. Arguments to logarithmic functions must be positive.

#### `log10::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_positive)`<br/>
Log base 10. Arguments to logarithmic functions must be positive.

#### `log2::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_positive)`<br/>
Log base 2. Arguments to logarithmic functions must be positive.

#### `loop::fn`
##### in namespace [`Function`](Function.md)
`(fn, max_iter = 1000000)::(is_fn)`<br/>
Takes a function that is in tail-recursive form and eliminates tail calls, if the recursive calls are made using `recur` instead of the function name. Also allows for looping of anonymous functions.

#### `lowcase::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Lowercases all characters in a string.

#### `lt::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Less than comparator, `<`. With one argument, partially applies itself. With two, returns `true` if the first is less than the second. With three or more, returns `true` if the numbers are in increasing order. Note that partial application is meant to be intuitive rather than rigorous: `lt(3)` returns a function that tests if its argument is less than 3: `lt(3, 4); //=> true`, but `lt(3)(4); //=> false`.

#### `lte::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Less than or equal to comparator, `<=`. With one argument, partially applies itself. With two, returns `true` if the first is less than or equal to the second. With three or more, returns `true` if the numbers are in increasing or flat order, e.g. `lte(1, 2, 3, 3); //=> true`. Note that partial application is meant to be intuitive rather than rigorous: `lte(3)` returns a function that tests if its argument is less than or equal to 3: `lte(3, 4); //=> true`, but `lte(3)(4); //=> false`.

#### `map::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Applies a transforming function to every element of a collection. With two arguments, takes a unary transforming function and a collection, and produces a new collection of that kind with all elements transformed by that function. With a single argument, takes a unary transforming function, and returns a mapping transducer. E.g. `map(add(1), [1 2 3]); //=> [2, 3, 4]

#### `mapcat::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, colls)`<br/>
First it maps, then it cats: applies map to a sequence of collections, and then cats those all together.

#### `max::fn`
##### in namespace [`Number`](Number.md)
`(...args)`<br/>
Returns the largest of the one or more numbers passed as arguments.

#### `maybe::method`
##### in namespace [`maybe::method`](maybe::method.md)


#### `members::fn`
##### in namespace [`members::function`](members::function.md)
`(...args)`<br/>
#### `merge::fn`
##### in namespace [`Object`](Object.md)
`(...objs)`<br/>
Creates a new object, combining the objects passed in. If objects duplicate a key, silently overwrites the value; later objects take precedence.E.g. `assign({a: 1, b: 2}, {b: 3, c: 4}); //=> {a: 1, b: 3, c: 4}`.

#### `meta::fn`
##### in namespace [`meta::function`](meta::function.md)
`(...args)`<br/>
#### `method::fn`
##### in namespace [`Function`](Function.md)
`({name, not_found, ...attrs})::(method_descriptor)`<br/>


#### `min::fn`
##### in namespace [`Number`](Number.md)
`(...args)`<br/>
Returns the smallest of the one or more numbers passed as arguments.

#### `mod::fn`
##### in namespace [`Number`](Number.md)
`(x, y)::(is_num, is_nonzero)`<br/>
Modulus operation, or the remainder. Returns the remainder when the first argument is divided by the second. Second argument must not be `0`.

#### `mult::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Multiplies numbers. With two or more arguments, multiplies all the arguments together. With one argument, partially applies `mult`, returning a function that will multiply all its arguments, and then multiply that product by the first. E.g., `mult(2, 3, 4); //=> 24` and `mult(2)(4); //=> 8`.

#### `none::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Determines if every element of a collection fails a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a falsy value---and false otherwise. With one argument, returns a transducer. E.g. `none(is_string, [1, 2, 3, {}]); //=> true`.

#### `norm::fn`
##### in namespace [`Number`](Number.md)
`(source_end)::(is_num)`<br/>
`(source_start, source_end)`<br/>
`(source_start, source_end, n)`<br/>
`(source_start, source_end, target_start, target_end)`<br/>
`(source_start, source_end, target_start, target_end, n)`<br/>
Normalizes a number, by mapping one range onto another. Takes a number in a range, determines where it is in that range, and then places it in the proportional place in the second range. With one, two, and four arguments, returns partially applied functions. 

  

  With one argument, `source_end`, `norm` returns a function mapping its input from the range `(0, source_end)` to the range `(0, 1)`. With two arguments, `norm` returns a function mapping its input from `(source_start, source_end)` to `(0, 1)`. With four arguments, `norm` returns a function that maps its input from `(source_start, source_end)` to `(target_start, target_end)`.

  

  With three and five arguments, `norm` returns the mapped value immediately. With three arguments, it returns the number mapped from `(source_start, source_end)` to `(0, 1)`. With five, it returns the number mapped from `(source_start, source_end)` to `(target_start, target_end)`

  

  E.g.s:

  `norm(100)(33); //=> 0.33` (This maps percentages to decimals.)

  `norm(10, 20)(12.5); //=> 0.25`

  `norm(0, 10, 50, 100, 5); //=> 75`

#### `not::method`
##### in namespace [`not::method`](not::method.md)


#### `ns::fn`
##### in namespace [`ns::function`](ns::function.md)
`(...args)`<br/>
#### `nth::fn`
##### in namespace [`Seq`](Seq.md)
`(n)::(is_int)`<br/>
`(n, coll)::(is_int, is_seqable)`<br/>
Gets the nth element of any `seq`able. With one argument, returns itself partially applied. Note that this runs in linear time, and if you frequently use this, you should consider using an indexed data structure (an array).

#### `num::fn`
##### in namespace [`Number`](Number.md)
`(x)`<br/>
Attempts to produce a number from another type. Numbers pass through unharmed. `false` is `0`, `true` is `1`; strings are parsed, and, if they look enough like a number that JS thinks it knows what to do with them, you get a number back. Anything else returns `undefined`.

#### `or::method`
##### in namespace [`or::method`](or::method.md)


#### `partial::fn`
##### in namespace [`Function`](Function.md)
`(fn, ...args)`<br/>
Partially applies a function. Takes a function and at least one argument to apply against the function when subsequent arguments are specified.

#### `pipe::fn`
##### in namespace [`Function`](Function.md)
`(...fns)`<br/>
Creates a pipeline of unary functions, returning a unary function. Passes the argument to the first function, and then passes the return value of the first to the second function, and so on. The first value must not be undefined. Handles errors reasonably gracefully.

#### `pow::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Exponentiation operation. When given two numbers, raises the first argument to the second. When given three or more numbers, raises the first to the second, and then raises the result of that to the third, and so on. When given one number, returns `pow` partially applied: a function that raises that first number to the power of the argument, e.g. `pow(3)(4); //=> 81` (and not 64). If you want a function that raises its argument to the power of a particular number, see `pow_by`.

#### `pow_by::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Takes a number argument `x`, and returns a function that raises its argument to the power of `x`, e.g. `pow_by(2)` squares numbers, `pow_by(3)` cubes them, and so on.

#### `precise::fn`
##### in namespace [`Number`](Number.md)
`(precision)::(is_num)`<br/>
`(precision, n)::(is_num, is_num)`<br/>
Rounds a number to the precision specified--to the number of digits to the right of the decimal point. `0` will round to integers. Negative entries will round to the left of the decimal point. One argument gives you a partially applied function.

#### `print::fn`
##### in namespace [`print::function`](print::function.md)
`(...msgs)`<br/>
#### `rad_to_deg::fn`
##### in namespace [`Number`](Number.md)
`(...args2)`<br/>
Given an angle measurement in radians, converts it to degrees.

#### `raise::fn`
##### in namespace [`raise::function`](raise::function.md)
`(err, ...msgs)`<br/>
#### `random::fn`
##### in namespace [`Number`](Number.md)
`()::()`<br/>
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_num)`<br/>
Returns a (pseudo)random number. With zero arguments, returns a random number between 0 (inclusive) and 1 (exclusive). Given one argument, returns a random number between 0 (inclusive) and its argument (exclusive). Given two arguments, returns a random number between them (inclusive of the first, exclusive of the second).

#### `random_int::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_int)`<br/>
`(x, y)`<br/>
Returns a random integer. Given one argument, returns a random integer between `0` (inclusive) and that value (exclusive). Given two arguments, returns a random integer between them (inclusive of the first argument, exclusive of the second argument). Arguments must be integers. E.g. `random_int(3); //=> 0, 1, or 2` and `random_int(1, 4); //=> 1, 2, or 3`.

#### `range::fn`
##### in namespace [`Lazy`](Lazy.md)
`(max)::(is_int)`<br/>
`(start, max)::(is_int, is_int)`<br/>
`(start, max, step)::(is_int, is_int, is_int)`<br/>
Creates a sequence of numbers, in order. With one argument, it counts up from 0 to the maximum (exclusive) in steps of +1. With two arguments, it counts up from the start to the max in steps of +1. With three, it counts up to max from start, in steps of whatever you give it.

#### `recur::fn`
##### in namespace [`recur::function`](recur::function.md)
`(...args)`<br/>
#### `reduce::fn`
##### in namespace [`Seq`](Seq.md)
`(f, coll)::(is_fn, is_seqable)`<br/>
`(f, accum, coll)::(is_fn, is_any, is_seqable)`<br/>


#### `ref::fn`
##### in namespace [`Ref`](Ref.md)
`({name, doc, value, ...attrs})::(ref_descriptor)`<br/>
Creates a ref

#### `report::fn`
##### in namespace [`report::function`](report::function.md)
`(...msgs)`<br/>
#### `rest::fn`
##### in namespace [`Seq`](Seq.md)
`(coll)::(is_seqable)`<br/>
Returns a `seq` containing all elements but the first of a `seq`able.

#### `round::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Rounds numbers to the nearest integer. It returns integers unchanged. In most cases, it rounds positive and negative numbers as you would expect, i.e. `round(3.3); //=> 3` and `round(-3.3); //=> -3`. However, arguments with a fractional portion of `0.5` are always rounded "up," in the direction of positive infinity: `round(3.5); //=> 4` but `round(-3.5); //=> -3`.

#### `second::fn`
##### in namespace [`Seq`](Seq.md)
`(...args2)`<br/>
Gets the second element of any `seq`able.

#### `seq::fn`
##### in namespace [`Seq`](Seq.md)
`(seqable)::(is_seqable)`<br/>
`(xform, seqable)::(is_fn, is_seqable)`<br/>
Generates a `seq` over any `iterable` thing: `list` & `vector`, but also `string` and `object`. `seq`s are lazy iterables, and they can be infinite.

#### `seq::fn`
##### in namespace [`seq::function`](seq::function.md)
`(...args)`<br/>
#### `show::fn`
##### in namespace [`show::function`](show::function.md)
`(first, ...rest)`<br/>
#### `sin::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
The sine of angle (in radians).

#### `slice::method`
##### in namespace [`slice::method`](slice::method.md)


#### `some::fn`
##### in namespace [`Ducers`](Ducers.md)
`(f)`<br/>
`(f, coll)`<br/>
Determines if any element of a collection passes a conditional function. With two arguments, returns true if any element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `some(is_int, [2.1, "foo", {a: 1}, 12]); //=> true`.

#### `split::fn`
##### in namespace [`String`](String.md)
`(sep)::(is_str)`<br/>
`(sep, str)`<br/>
Splits a string into substrings, using a separator that is also a string. Returns an array of strings. With one argument, returns a function that splits strings using the argument as a separator. With two arguments, splits the second string using the first as the separator.

#### `sqrt::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_not_negative)`<br/>
Takes the square root of a non-negative number.

#### `str::fn`
##### in namespace [`String`](String.md)
`()`<br/>
`(x)`<br/>
`(x, y, ...more)`<br/>
Produces a quick and dirty string representation of any arguments it is given, concatenating the resulting strings. It returns strings unharmed. With zero arguments, it returns the empty string. Note that these string representations dispatch to JS's `toString` method on a value, which may not produce lovely or especially informative results: `string({}); //=> '[object Object]'` and `string([1, 2, 3]); //=> '1,2,3'`. For prettier (and slower) output, see `show`.

#### `sub::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
`(x, y)`<br/>
`(x, y, z, ...more)`<br/>
Subtracts numbers. With two arguments, subtracts the second from the first. E.g. `sub(10, 4); //=> 6`. With three or more arguments, subtracts from the first argument the sum of the remaining arguments. E.g., `sub(10, 2,3); //=> 5`. With a single argument, returns `sub` partially applied, which will subtract the sum of any arguments from the original first argument. E.g. `sub(10)(1, 2, 3); //=> 4`. Note that this is perhaps unintuitive behavior. If you want a function that will subtract a given amount from its argument, see `sub_by`.

#### `sub_by::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Takes a number and returns a unary function that subtracts that first number from its argument, e.g. `sub_by(3)(10); //=> 7`.

#### `sum_of_squares::fn`
##### in namespace [`Number`](Number.md)
`(...xs)`<br/>
Returns the sum of the squares of the numbers passed in. To compare the magnitude of vectors quickly, use `sum_of_squares`: it avoids the costly `sqrt` step in `hypot`.

#### `swap::fn`
##### in namespace [`Ref`](Ref.md)
`(ref, new_value)::(is<partial (t:{Ref})>, is_any)`<br/>
Updates the value in a ref, mutating its state. Returns undefined.

#### `take::fn`
##### in namespace [`Ducers`](Ducers.md)
`(n)`<br/>
`(n, coll)`<br/>
Takes the first n elements of a collection. With two arguments, takes a number of elements to keep and a collection, and produces a new collection of that kind that includes only the first n elements. With a single argument, takes an non-negative integer, and returns a taking transducer. Especially useful for dealing with infinite sequences. E.g. `take(4, [1, 2, 3, 4, 5, 6, 7]); //=> [1, 2, 3, 4]`

#### `tan::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
The tangent of an angle (in radians): returns the slope of the line with that angle.

#### `third::fn`
##### in namespace [`Seq`](Seq.md)
`(...args2)`<br/>
Gets the third element of any `seq`able.

#### `thread::fn`
##### in namespace [`Function`](Function.md)
`(value, ...fns)`<br/>
`thread`s a value through a series of functions, i.e. the value is passed to the first function, the return value is then passed ot the second,then the third, etc. Each fn must have an arity of 1. The passed value must not be `undefined`.

#### `thunk::fn`
##### in namespace [`Function`](Function.md)
`(fn, ...args)::(is_fn)`<br/>
Represents a deferred computation: takes a function and a set of arguments and returns a nullary function that will apply the arguments to that function when it is called.

#### `transduce::fn`
##### in namespace [`Seq`](Seq.md)
`(xform, reducer, coll)::(is_fn, is_fn, is_seqable)`<br/>
`(xform, reducer, accum, coll)::(is_fn, is_fn, is_any, is_seqable)`<br/>
Transduce is a transforming reducer. (Again, explaining this? Ugh.)

#### `trim::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Trims all preceding and trailing whitespace from a string. E.g., `trim('    foo  '); //=>  'foo'`.

#### `trunc::fn`
##### in namespace [`Number`](Number.md)
`(x)::(is_num)`<br/>
Truncates the decimal portions of a number, returning integers unchanged. E.g. `trunc(3.1); //=> 3`. The `trunc` of negative numbers rounds "up," towards `0`: `trunc(-3.1); //=> -3`. Compare to `floor`.

#### `tup::fn`
##### in namespace [`tup::function`](tup::function.md)
`(...args)`<br/>
#### `type::fn`
##### in namespace [`type::function`](type::function.md)
`(...args)`<br/>
#### `type_of::fn`
##### in namespace [`type_of::function`](type_of::function.md)
`(...args)`<br/>
#### `unwatch::fn`
##### in namespace [`Ref`](Ref.md)
`(watcher)::(is<partial (t:{Watcher})>)`<br/>
Removes a watcher from a ref, such that it will no longer be called when the ref's value changes.

#### `upcase::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Uppercases all characters in a string.

#### `update::method`
##### in namespace [`update::method`](update::method.md)


#### `values::fn`
##### in namespace [`Object`](Object.md)
`(obj)`<br/>
Returns an array of the values stored in an object. Returns an empty array if the object has no properties.

#### `warn::fn`
##### in namespace [`warn::function`](warn::function.md)
`(...msgs)`<br/>
#### `watch::fn`
##### in namespace [`Ref`](Ref.md)
`(ref, fn, ...args)::(is<partial (t:{Ref})>, is_fn)`<br/>
Adds a watcher to a ref. The function (presumably with side effects) will be called whenever the ref changes value (i.e. somebody, somewhere `swap`ped the ref). It will call `fn` with any additional arguments passed to `watch`. Returns a Watcher, which you can then pass to `unwatch` to cancel the watcher.

#### `when::fn`
##### in namespace [`Flow`](Flow.md)
`(x)`<br/>
`when` is the core conditional form of Ludus. It is like a normal function (and the function part behaves exactly as `bool`), but it must be followed by two conditional expressions: `when({condition}) ? {if_true} : {if_false}`. Unlike other Ludus conditional forms, the `{if_true}` and `{if_false}` expressions are only executed when the condition passed to `when` is, respectively, `truthy` and `falsy`.

#### `words::fn`
##### in namespace [`String`](String.md)
`(str)::(is_str)`<br/>
Splits a string into "words," by splitting and removing any whitespace, and stripping common punctuation marks. Numbers, emoji, other characters, etc., remain.

#### `wrap::fn`
##### in namespace [`Number`](Number.md)
`(to)::(is_num)`<br/>
`(from, to)::(is_num, is_num)`<br/>
`(from, to, x)::(is_num, is_num, is_num)`<br/>
Wraps a value around a range described by `from` (inclusive) and `to` (exclusive). Particularly useful for wrapping angles around a circle.

## Values
`runtime`<br/>
`pi`<br/>
`e`<br/>
`sqrt2`<br/>
`sqrt1_2`<br/>
`ln2`<br/>
`ln10`<br/>
`log2e`<br/>
`log10e`