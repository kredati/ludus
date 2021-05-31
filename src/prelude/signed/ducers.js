//////////////////// Transducers
// Reduction is a fundamental computational operation, traversing a collection
// and keeping a running tally of results. `reduce` has the following signature:
// `((a, b) -> a, a, [b]) -> b`. I'm still figuring out how to explain reduce
// without simply multiplying examples.

// Clojure introduces the concept of "transforming reducers," which allow for
// a very powerful operation: composing transformations of a collection, e.g.
// `map` and `filter`, without producing intermediate collections. In other
// words, if a computation is expressible by reduction over a collection---
// and a shocking number are!---then it's easy to write performant reducers
// that are composed of simple functions.

// Note that the function composition of transducers happens in the opposite 
// order of normal function composition. Where you would use `pipe` for normal 
// function composition, use `comp` for transducers.

// Note that some of the fundamental operations of transducers---`reduce`,
// `transduce`, `seq`, `into`---are defined in `seq`, as abstractions over
// `seq`. This namespace, instead, defines the transducers themselves:
// composable transducing functions.

// This document, as of May 2021, is definitely still a work in progress:
// TODO:
// [ ] add more transduction functions (list at end of file)
// [*] figure out lazy transduction, if it makes sense for Ludus
// [ ] improve documentation
// [ ] spec all the transducers
// [ ] consider how to instrument the transducers, if at all
// [ ] consider moving zip, etc. to another namespace
// [ ] improve transducers/reduce/etc. to clj interface (0, 1, and 2-arity)

import P from './preds.js';
import Seq from './seqs.js';
import Spec from './spec.js';
import A from './arr.js';
import Fn from './fns.js';
import L from './lazy.js';
import NS from './ns.js';

let {args, fn, coll, any, int} = Spec;
let {defn, defmethod} = Fn;
let {bool} = P;
let {into, complete} = Seq;
let {interleave} = L;
let {ns} = NS;

let empty = defmethod({name: 'empty'});

let map = defn({
  name: 'map',
  doc: 'Applies a transforming function to every element of a collection. With two arguments, takes a unary transforming function and a collection, and produces a new collection of that kind with all elements transformed by that function. With a single argument, takes a unary transforming function, and returns a mapping transducer. E.g. `map(add(1), [1 2 3]); //=> [2, 3, 4]',
  body: [
  (f) => (rf) => (accum, x) => rf(accum, f(x)),
  (f, coll) => into(empty(coll), map(f), coll)
]});

let filter = defn({
  name: 'filter',
  doc: 'Applies a filtering function to a collection, keeping only elements that return a truthy value from that function. With two arguments, takes a unary filtering function and a collection, and produces a new collection of that kind that only includes elements that pass the filter. With a single argument, takes a unary filtering function, and returns a filtering transducer. E.g. `filter(lte(3), [1, 2.3, 4.542, 3, -2]); //=> [4.542, 3]',
  body: [
    (f) => (rf) => (accum, x) => bool(f(x)) ? rf(accum, x) : accum,
    (f, coll) => into(empty(coll), filter(f), coll)
  ]
});

let take = defn({
  name: 'take',
  doc: 'Takes the first n elements of a collection. With two arguments, takes a number of elements to keep and a collection, and produces a new collection of that kind that includes only the first n elements. With a single argument, takes an non-negative integer, and returns a taking transducer. Especially useful for dealing with infinite sequences. E.g. `take(4, [1, 2, 3, 4, 5, 6, 7]); //=> [1, 2, 3, 4]`',
  body: [
    (n) => {
      let count = 0;
      return (rf) => (accum, x) => {
        if (count >= n) return complete(accum);
        count += 1;
        return rf(accum, x);
      };
    },
    (n, coll) => into(empty(coll), take(n), coll)
  ]
});

let keep = defn({
  name: 'keep',
  doc: 'Filters a collection by taking a function, `f`, removing any element, `x`, where `f(x)` evaluates to `undefined`. With two arguments, takes a keeping function and a collection, and returns a collection of the same type with `undefined` elements removed. With a single arguemnt, returns a transducer. E.g. `keep(id, [1, undefined, 4, undefined, 6]; //=> [1, 4, 6]',
  body: [
    (f) => (rf) => (accum, x) => f(x) == undefined ? accum : rf(accum, x),
    (f, coll) => into(empty(coll), keep(f), coll)
  ]
});

let every = defn({
  name: 'every',
  doc: 'Determines if every element of a collection passes a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `every(is_int, [1, 2, "foo"]); //=> false`.',
  body: [
    (f) => (rf) => (_, x) => bool(f(x)) ? rf(true, true) : complete(false),
    (f, coll) => transduce(every(f), B.and, true, coll)
  ]
});

let some = defn({
  name: 'some',
  doc: 'Determines if any element of a collection passes a conditional function. With two arguments, returns true if any element, with the conditional function applied, returns a truthy value---and false otherwise. With one argument, returns a transducer. E.g. `some(is_int, [2.1, "foo", {a: 1}, 12]); //=> true`.',
  body: [
    (f) => (rf) => (_, x) => bool(f(x)) ? complete(true) : rf(false, false),
    (f, coll) => transduce(some(f), B.or, false, coll)
  ]
});

let none = defn({
  name: 'none',
  doc: 'Determines if every element of a collection fails a conditional function. With two arguments, returns true if every element, with the conditional function applied, returns a falsy value---and false otherwise. With one argument, returns a transducer. E.g. `none(is_string, [1, 2, 3, {}]); //=> true`.',
  body: [
    (f) => (rf) => (_, x) => bool(f(x)) ? complete(false) : rf(true, true),
    (f, coll) => transduce(none(f), B.and, true, coll)
  ]
});


let chunk = defn({
  name: 'chunk',
  doc: 'Segments a collection into n-sized array chunks. With two arguments, an integer, `n`, and a collection, returns a collection of the same type chunked into arrays of the size `n`, discarding any elements that do not fill the last chunk (thus guaranteeing all chunks will be of size `n`). With a single argument, returns a transducer. E.g. `chunk(3, [1, 2, 3, 4, 5, 6]); //=> [[1, 2, 3], [4, 5, 6]]`.',
  body: [
    (n) => {
      let chunk = [];
      return (rf) => (accum, x) => {
        chunk = A.conj_(chunk, x);
        if (chunk.length === n) {
          let out = chunk;
          chunk = [];
          return rf(accum, out)
        }
        return accum;
      };
    },
    (n, coll) => into(empty(coll), chunk(n), coll)
  ]
});

let zip = defn({
  name: 'zip',
  body: (...seqs) => 
    into(empty(seqs[0]), chunk(seqs.length), interleave(...seqs))
});

///// Transduers to add
// cat
// mapcat
// flat
// unique
// dedupe
// interpose
// chunk_by
// drop
// drop_while
// drop_nth
// take_while
// take_nth
// remove
// on_keys
// on_values
// partition, _while, _by?

export default ns({
  name: 'Ducers', 
  members: {
    every, filter, keep, map, none, some, zip
}});
