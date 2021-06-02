//////////////////// Predicates
// A collection of useful predicate functions that map
// information about JS values to functions.
// Equality, however, is handled in './eq.js'.

import {NS, Type} from './base.js';
import {copy_attrs} from './util.js';

let {is, types} = Type;
let {ns} = NS;

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

let is_undef = (x) => x == undefined;

// tells if a value is `not` undefined
let is_some = (x) => !is_undef(x);

let is_str = (x) => typeof x === 'string';

let is_num = (x) => typeof x === 'number';

// tells if a value is a number that is also an integer
let is_int = (x) => is_num(x) && (x | 0) === x;

let is_key = (x) => is_int(x) || is_str(x);

// for now, Ludus doesn't have bigints
// let is_bigint = (x) => typeof x === 'bigint';

let is_bool = (x) => typeof x === 'boolean';

let is_fn = (x) => typeof x === 'function';

let is_arr = (x) => is(types.arr, x);

// tells if a value is a js object
// this is almost always not interesting in Ludus
let is_js_obj = (x) => is(types.obj, x);

// tells if a value is an "associative data structure" in Ludus
// for the most part, this means Object literals
// this excludes any objects that are constructed using `new`
// but it does not exclude objects that are created using Object.create
// Ludus objects are all `create`d, but also always set a constructor
// property on the prototype, so this should exclude any Ludus objects
// TODO: determine if this is the right definition for an `assoc`
let is_obj = (x) => is_js_obj(x) && x.constructor === Object;

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
let is_coll = (x) => is_obj(x) || is_sequence(x);

let is_indexed = (x) => is_str(x) || is_arr(x)

// tells if a collection or string is not empty
let is_not_empty = (x) => {
  if (!is_coll(x) && !is_str(x)) return false;
  if (x.length || x.size) return true;
  if (is_iter(x)) {
    for (let _ of x) {
      return true;
    }
    return false;
  }
  if (is_obj(x)) {
    for (let _ in x) {
      return true;
    }
  }
  return false;
};

let is_empty = (x) => is_coll(x) || is_str(x)
  ? !is_not_empty(x)
  : false;

let is_ = (type) => (x) => is(type, x);

export default ns({
  name: 'Pred', 
  members: {
    bool, and, or, not, is_any, is_undef, is_some, 
    is_str, is_num, is_int, is_bool,
    is_fn, is_arr, is_obj, is_js_obj, is_iter, is_sequence, is_coll, is_not_empty, is_key, is_indexed, is_empty, is: is_
  }
});
