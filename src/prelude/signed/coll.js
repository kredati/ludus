//////////////////// Collections and sequences
// The following are the common abstractions for collections
// and sequences. These aren't quite the same as seqs, which
// themselves abstract over the functions these datatypes work on.
// Instead, these are the functions that should work similarly on
// all Ludus collections:
// * JS arrays
// * Ludus immutable arrays (LIAs)
// * JS objects
// * Ludus immutable hashes (LIHs)
// * Ludus lists
// ? JS Sets

import F from './fns.js';
import L from './deps.js';
import P from './preds.js';

let is_assoc; // The version of this in preds is incorrect
// it should return true for object literals, arrays, LIAs and LIHs
// it should not return true for lists or sets (when I implement them)

let assoc = defn({
  name: 'assoc',
  doc: 'Associates a key with a value in any associative collection.',
  body: (coll, key, value) => {
    // cases:
    // coll is js array: array -> LIA -> LIA.assoc
    // coll is js obj: obj -> LIH -> LIH.assoc
    // coll is LIA: LIA.assoc
    // coll is LIH: LIH.assoc
  }
});

let dissoc;

let conj;

let conj_;

let out_;

let unconj;

let merge;

let update;

let keys;

let values;

let entries;

