# `Ducers::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `cat::fn`
`(rf)`<br/>
A transducer that concatenates the contents of each input, which must be seqable, into the reduction.

***
#### `chunk::fn`
`(n)`<br/>
`(n, coll)`<br/>
Segments a collection into n-sized array chunks. With two arguments, an integer, `n`, and a collection, returns a collection of the same type chunked into arrays of the size `n`, discarding any elements that do not fill the last chunk (thus guaranteeing all chunks will be of size `n`). With a single argument, returns a transducer. E.g. `chunk(3, [1, 2, 3, 4, 5, 6]); //=> [[1, 2, 3], [4, 5, 6]]`.

***
#### `every::fn`
`(f)`<br/>
`(f, coll)`<br/>
Determines if every element of a collection passes a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `every(is_int, [1, 2, "foo"]); //=> false`.

***
#### `filter::fn`
`(f)`<br/>
`(f, coll)`<br/>
Applies a filtering function to a collection, keeping only elements that return a truthy value from that function. With two arguments, takes a unary filtering function and a collection, and produces a new collection of that kind that only includes elements that pass the filter. With a single argument, takes a unary filtering function, and returns a filtering transducer. E.g. `filter(lte(3), [1, 2.3, 4.542, 3, -2]); //=> [4.542, 3]

***
#### `keep::fn`
`(f)`<br/>
`(f, coll)`<br/>
Filters a collection by taking a function, `f`, removing any element, `x`, where `f(x)` evaluates to `undefined`. With two arguments, takes a keeping function and a collection, and returns a collection of the same type with `undefined` elements removed. With a single arguemnt, returns a transducer. E.g. `keep(id, [1, undefined, 4, undefined, 6]; //=> [1, 4, 6]

***
#### `map::fn`
`(f)`<br/>
`(f, coll)`<br/>
Applies a transforming function to every element of a collection. With two arguments, takes a unary transforming function and a collection, and produces a new collection of that kind with all elements transformed by that function. With a single argument, takes a unary transforming function, and returns a mapping transducer. E.g. `map(add(1), [1 2 3]); //=> [2, 3, 4]

***
#### `mapcat::fn`
`(f)`<br/>
`(f, colls)`<br/>
First it maps, then it cats: applies map to a sequence of collections, and then cats those all together.

***
#### `none::fn`
`(f)`<br/>
`(f, coll)`<br/>
Determines if every element of a collection fails a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a falsy value---and false otherwise. With one argument, returns a transducer. E.g. `none(is_string, [1, 2, 3, {}]); //=> true`.

***
#### `some::fn`
`(f)`<br/>
`(f, coll)`<br/>
Determines if any element of a collection passes a conditional function. With two arguments, returns true if any element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `some(is_int, [2.1, "foo", {a: 1}, 12]); //=> true`.

***
#### `take::fn`
`(n)`<br/>
`(n, coll)`<br/>
Takes the first n elements of a collection. With two arguments, takes a number of elements to keep and a collection, and produces a new collection of that kind that includes only the first n elements. With a single argument, takes an non-negative integer, and returns a taking transducer. Especially useful for dealing with infinite sequences. E.g. `take(4, [1, 2, 3, 4, 5, 6, 7]); //=> [1, 2, 3, 4]`

***
#### `zip::fn`
`(...seqs)`<br/>


## Values
