//////////////////// Transducers

import L from './deps.js';
import P from './preds.js';
import S from './seqs.js';
import Spec from './spec.js';
import NS from './ns.js'; 
import A from './arr.js';
import Fn from './fns.js';
import M from './method.js';
import N from './nums.js';
import List from './list.js';

let {args, seq, function: fn, or, coll, assoc, iter, any} = Spec;
let {defn, recur} = Fn;
let {is_fn, is_assoc, is_iter, is_any, bool} = P;
let {first, rest, is_empty} = S;

let completed = Symbol('ludus/completed');

let complete = defn({
  name: 'complete',
  doc: 'Short-circuits `reduce`, returning the value and halting the reduction.',
  body: (value) => ({value, [completed]: true})
});

let reduce = defn({
  name: 'reduce',
  doc: 'Reduces a collection. (Oy, how do we explain reduce?)',
  pre: args([fn, coll], [fn, any, coll]),
  body: [
    (f, coll) => reduce(f, first(coll), rest(coll)),
    (f, accum, coll) => {
      if (bool(accum[completed])) return accum.value;
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

// THIS IS WHERE WE USE THE FASTER MUTATING FUNCTIONS
// Notes:
/*
  - The fastest data structure here is a mutable array; use that under the hood
  - We only need a method that allows us to add an iterable to another iterable: `concat`
  - What that then allows is to use a mutable array here: we always use a mutable array
  - Just to be sure: Ludus native colls at this point are: string, list, array, and object. No sets or maps--yet. We just need to be sure each of these have the thing.
*/

let concat = M.defmethod({name: 'concat'});

let into = defn({
  name: 'into',
  doc: 'Takes the contents of one collection and puts them into another, working across types. Takes an optional transforming function.',
  pre: args([coll, coll], [coll, fn, coll]),
  body: [
    (to, from) => into(to, (x) => x, from),
    (to, xform, from) => concat(to, transduce(xform, A.conj_, [], from))
  ]
});

let sequence = defn({
  name: 'sequence',
  doc: 'Transforms a ',
  body: () => {} // do something
});

//list
//array
//string
//object

/*
let map = n_ary('map',
  (f) => (rf) => (accum, x) => rf(accum, f(x)),
  (f, coll) => transduce(map(f), conj, empty(coll), coll)
);

/*
let filter = n_ary('filter',
  (f) => (rf) => (accum, x) => boolean(f(x)) ? rf(accum, x) : accum,
  (f, coll) => transduce(filter(f), conj, empty(coll), coll)
);

let take = n_ary('take',
  (n) => {
    let count = 0;
    return (rf) => (accum, x) => {
      if (count >= n) return complete(accum);
      count += 1;
      return rf(accum, x);
    };
  },
  (n, coll) => transduce(take(n), conj, empty(coll), coll)
);

// TODO: make keep a nullary reducer?
// switch not on arity but on the type of the argument: function or not?
// e.g. multimethod, not n_ary
let keep = n_ary('keep',
  (f) => (rf) => (accum, x) => f(x) == undefined ? accum : rf(accum, x),
  (f, coll) => transduce(keep(f), conj, empty(coll), coll)
);

let every = n_ary('every',
  (f) => (rf) => (_, x) => boolean(f(x)) ? rf(true, true) : complete(false),
  (f, coll) => transduce(every(f), (x, y) => x && y, true, coll)
);

let some = n_ary('some',
  (f) => (rf) => (_, x) => boolean(f(x)) ? complete(true) : rf(false, false),
  (f, coll) => transduce(some(f), (x, y) => x || y, false, coll)
);

let chunk = n_ary('chunk',
  (n) => {
    let chunk = [];
    return (rf) => (accum, x) => {
      chunk = conj(chunk, x);
      if (chunk.length === n) {
        let out = chunk;
        chunk = [];
        return rf(accum, out)
      }
      return accum;
    };
  },
  (n, coll) => transduce(chunk(n), conj, empty(coll), coll)
);

let zip = (...seqs) => 
  transduce(chunk(seqs.length), conj, [], interleave(...seqs));

///// Transduers to add
// cat
// flat
// unique
// dedupe
// interpose
// chunk_by
// repeat
// drop
// drop_while
// drop_nth
// take_while
// take_nth
// remove
// none
// on_keys
// on_values

export let transducers = {reduce, transduce, into, map, complete, filter, take, zip, chunk, every, some, keep};
*/