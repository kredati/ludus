//////////////////// Predicates
// A collection of useful predicate functions that map
// information about JS values to functions.
// Equality, however, is handled in './eq.js'.

import {NS, Type} from './base.js';
import {copy_attrs} from './util.js';

let {is, types} = Type;

// All predicates have the signature (value) -> boolean

// bool :: (value) -> boolean
// it's a predicate! could be called `is_truthy`
// converts a value to Ludus-boolean:
// the only falsy values are `false` and `undefined`
// (or `null`, but Ludus has no concept of `null`)
let bool = (x) => x !== false && x != undefined;

// basic predicate combinators
// this may not land in core but will be useful in prelude
let or = (...preds) => copy_attrs((x) => {
  for (let pred of preds) {
    if (bool(pred(x))) return true;
  }
  return false;
}, {name: `or<${preds.map((p) => p.name).join(', ')}>`});

let and = (...preds) => copy_attrs((x) => {
  for (let pred of preds) {
    if (!bool(pred(x))) return false;
  }
  return true;
}, {name: `and<${preds.map((p) => p.name)}>`});

let not = (pred) => copy_attrs(
  (x) => !bool(pred(x)), 
  {name: `not<${pred.name}>`});

// everything passes this predicate
let is_any = (_) => true;

let is_undef = (x) => is(types.undef, x);

// tells if a value is `not` undefined
let is_some = (x) => !is(types.undef, x);

let is_string = (x) => is(types.str, x);

let is_number = (x) => is(types.num, x);

// tells if a value is a number that is also an integer
let is_int = (x) => is_number(x) && (x | 0) === x;

// for now, Ludus doesn't have bigints
// let is_bigint = (x) => typeof x === 'bigint';

let is_bool = (x) => is(types.bool, x);

let is_fn = (x) => is(types.fn, x);

let is_array = (x) => is(types.arr, x);

// tells if a value is a js object
// this is almost always not interesting in Ludus
let is_obj = (x) => is(types.obj, x);

// tells if a value is an "associative data structure" in Ludus
// for the most part, this means Object literals
// this excludes any objects that are constructed using `new`
// but it does not exclude objects that are created using Object.create
// Ludus objects are all `create`d, but also always set a constructor
// property on the prototype, so this should exclude any Ludus objects
// TODO: determine if this is the right definition for an `assoc`
let is_assoc = (x) => is_obj(x) && x.constructor === Object;

// tells if a value is iterable, according to the JS protocol
// it does a lot of trusting: it doesn't check if the implementation of
// the iterator protocol is correct, it just checks if there's a function
// at Symbol.iterator
// iterable: strings, arrays, Maps, Sets, vectors, HashMaps, lists, etc.
// not iterable: assoc, or objects
// TODO: determine if this is the right definition for is_iter:
// it's entirely possible we want instead meta(x).ns.iterate
// although strings won't satsify that?
let is_iter = (x) => x != undefined && typeof x[Symbol.iterator] === 'function';

// tells if a value is a sequence: an iterable that is not a string
// i.e. if it's an iterable object
let is_sequence = (x) => 
  x != undefined 
  && typeof x !== 'string' 
  && typeof x[Symbol.iterator] === 'function';

// tells if a value is a "collection": a sequence or an assoc.
let is_coll = (x) => is_assoc(x) || is_sequence(x);

// tells if a collection is not empty
let is_not_empty = (x) => {
  if (!is_coll(x)) return false;
  if (x.length || x.size) return true;
  if (is_iter(x)) {
    let is_empty = true;
    for (let _ of x) {
      is_empty = false;
      break;
    }
    return !is_empty;
  }
  return Object.keys(x).length > 0;
}

export default NS.ns({name: 'Preds', members: {
  bool, and, or, not, is_any, is_undef, is_some, 
  is_string, is_number, is_int, is_bool,
  is_fn, is_array, is_obj, is_assoc, is_iter, is_sequence, is_coll, is_not_empty
}});
