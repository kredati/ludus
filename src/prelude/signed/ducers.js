import { recur } from '../unsigned/fns.js';
//////////////////// Transducers

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';
import S from './seqs.js';
import A from './arr.js';

let {sign, splat} = L;
let {defn} = F;
let {is_fn, or, is_assoc, is_iter, is_any, bool} = P;
let {first, rest, is_empty} = S;

let is_coll = or(is_assoc, is_iter);

let completed = Symbol('ludus/completed');

let complete = defn({
  name: 'complete',
  doc: 'Short-circuits `reduce`, returning the value and halting the reduction.',
  body: (value) => ({value, [completed]: true})
});

let reduce = defn({
  name: 'reduce',
  doc: 'Reduces a collection. (Oy, how do we explain reduce?)',
  pre: sign([is_fn, is_coll], [is_fn, is_any, is_coll]),
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
  pre: sign([is_fn, is_fn, is_coll], [is_fn, is_fn, is_any, is_coll]),
  body: [
    (xform, reducer, coll) => reduce(xform(reducer), coll),
    (xform, reducer, accum, coll) => reduce(xform(reducer), accum, coll)
  ] 
});

// THIS IS WHERE WE USE THE FASTER MUTATING FUNCTIONS
let into = defn({
  name: 'into',
  body: [  
    (to, from) => transduce(id, conj, to, from),
    (to, from, xform) => transduce(xform, conj, to, from)
  ]
});

let into_arr = (to, from, xform) => {
  let out = transduce(xform, conj_, [], seq(from));
  return concat(to, out)
};

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