//////////////////// Ducers
// Ducers: reducers and transducers
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
import B from './bools.js';
import L from './lazy.js';
import NS from './ns.js';

let {args, fn, coll, any} = Spec;
let {defn, recur, defmethod} = Fn;
let {bool} = P;
let {first, rest, is_empty} = Seq;
let {interleave} = L;
let {ns} = NS;

let completed = Symbol('ludus/completed');

let complete = defn({
  name: 'complete',
  doc: 'Short-circuits `reduce`, returning the value and halting the reduction. Used to optimize transducers that do not traverse a whole collection.',
  body: (value) => ({value, [completed]: true})
});

let reduce = defn({
  name: 'reduce',
  doc: 'Reduces a collection. (Oy, how do we explain reduce?)',
  pre: args([fn, coll], [fn, any, coll]),
  body: [ 
    (f, coll) => reduce(f, first(coll), rest(coll)),
    (f, accum, coll) => {
      if (accum != undefined && bool(accum[completed])) return accum.value;
      if (is_empty(coll)) return accum;
      return recur(f, f(accum, first(coll)), rest(coll));
    }
  ]
});

let transduce = defn({
  name: 'transduce',
  doc: 'Transduce is a transforming reducer. (Again, explaining this? Ugh.)',
  pre: args([fn, fn, coll], [fn, fn, any, coll]),
  body: [
    (xform, reducer, coll) => reduce(xform(reducer), coll),
    (xform, reducer, accum, coll) => reduce(xform(reducer), accum, coll)
  ]
});

let concat = defmethod({name: 'concat'});

let empty = defmethod({name: 'empty'});

let into = defn({
  name: 'into',
  doc: 'Takes the contents of one collection and puts them into another, working across types. Takes an optional transducer.',
  pre: args([coll, coll], [coll, fn, coll]),
  body: [
    (to, from) => into(to, (x) => x, from),
    (to, xform, from) => concat(to, transduce(xform, A.conj_, [], from))
  ]
});

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

export default ns({name: 'Ducers', members: {
  reduce, transduce, complete, every, filter, into, keep, map, none, some, zip,
  concat, empty
}});
