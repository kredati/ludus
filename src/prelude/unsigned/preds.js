//////////////////// Predicates
// A collection of useful predicate functions that map
// information about JS values to functions.
// Equality, however, is handled in './eq.js'.

let bool = (x) => x !== false && x != undefined;

let is_any = (_) => true;

let is_undef = (x) => x == undefined;

let is_some = (x) => x != undefined;

let is_string = (x) => typeof x === 'string';

let is_number = (x) => typeof x === 'number';

let is_int = (x) => is_number(x) && x % 1 === 0;

let is_bigint = (x) => typeof x === 'bigint';

let is_bool = (x) => typeof x === 'boolean';

let is_symbol = (x) => typeof x === 'symbol';

let is_fn = (x) => typeof x === 'function';

let is_obj = (x) => x !== null && typeof x === 'object';

let is_assoc = (x) => x != undefined && x.constructor === Object;

let is_iter = (x) => x != undefined && typeof x[Symbol.iterator] === 'function';

let is_sequence = (x) => 
  x != undefined 
  && typeof x !== 'string' 
  && typeof x[Symbol.iterator] === 'function';

export {
  bool, is_any, is_undef, is_some, 
  is_string, is_number, is_int, is_bigint, is_bool, is_symbol,
  is_fn, is_obj, is_assoc, is_iter, is_sequence,
};