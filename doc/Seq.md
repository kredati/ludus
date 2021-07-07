# `Seq::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `complete::fn`
`(value)`<br/>
Short-circuits `reduce`, returning the value and halting the reduction. Used to optimize transducers that do not traverse a whole collection.

***
#### `concat::fn`
`(...colls)`<br/>
Concatenates `seqable`s, placing one after the other.

***
#### `count::fn`
`(x)::(is_seqable)`<br/>
Determines the size of a collection.

***
#### `empty::fn`
`()`<br/>
Returns an empty seq.

***
#### `first::fn`
`(coll)::(is_seqable)`<br/>
Gets the first element of any `seq`able.

***
#### `flatten::fn`
`(seqs)`<br/>
`(xform, seqs)`<br/>
Takes any nested combination of sequences and returns their contents as a single, flat, lazy sequence.

***
#### `fourth::fn`
`(...args2)`<br/>
Gets the fourth element of any `seq`able.

***
#### `into::fn`
`(to, from)::(is_coll, is_seqable)`<br/>
`(to, xform, from)::(is_coll, is_fn, is_seqable)`<br/>
Takes the contents of a seqable and puts them into a collection (NB: the first argument to `into` may not be a string). Takes an optional transducer.

***
#### `is_complete::fn`
`(x)`<br/>
Tells if a value, presumably passed to a reducing function, has completed the reduction.

***
#### `is_empty::fn`
`(coll)::(is_seqable)`<br/>
Tells if a seqable is empty.

***
#### `is_seq::fn`
`(x)`<br/>
Tells if something is a `seq`. Note that this means it is an actual instance of `seq`--lazy and abstract--and not something that is seqable. For that, use `is_seqable`.

***
#### `is_seqable::fn`
`(x)`<br/>
***
#### `iterate::fn`
`(seq)::(is<partial (t:{Seq})>)`<br/>
Creates an iterator over a `seq`.

***
#### `nth::fn`
`(n)::(is_int)`<br/>
`(n, coll)::(is_int, is_seqable)`<br/>
Gets the nth element of any `seq`able. With one argument, returns itself partially applied. Note that this runs in linear time, and if you frequently use this, you should consider using an indexed data structure (an array).

***
#### `reduce::fn`
`(f, coll)::(is_fn, is_seqable)`<br/>
`(f, accum, coll)::(is_fn, is_any, is_seqable)`<br/>


***
#### `rest::fn`
`(coll)::(is_seqable)`<br/>
Returns a `seq` containing all elements but the first of a `seq`able.

***
#### `second::fn`
`(...args2)`<br/>
Gets the second element of any `seq`able.

***
#### `seq::fn`
`(seqable)::(is_seqable)`<br/>
`(xform, seqable)::(is_fn, is_seqable)`<br/>
Generates a `seq` over any `iterable` thing: `list` & `vector`, but also `string` and `object`. `seq`s are lazy iterables, and they can be infinite.

***
#### `show::fn`
`(seq)::(is<partial (t:{Seq})>)`<br/>
Shows a `seq`.

***
#### `third::fn`
`(...args2)`<br/>
Gets the third element of any `seq`able.

***
#### `transduce::fn`
`(xform, reducer, coll)::(is_fn, is_fn, is_seqable)`<br/>
`(xform, reducer, accum, coll)::(is_fn, is_fn, is_any, is_seqable)`<br/>
Transduce is a transforming reducer. (Again, explaining this? Ugh.)

## Values
`t`