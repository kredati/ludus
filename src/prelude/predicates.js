//////////////////// Predicates
// A collection of useful predicate functions that map
// information about JS values to functions.
// Equality, however, is handled in './eq.js'.

import {defn, partial} from './functions.js';



let is_undef = defn({
  name: 'is_undef',
  doc: 'Returns true if the passed value is undefined.',
  body: (x) => x == undefined
});

let is_some = defn({
  name: 'is_some',
  doc: 'Returns true if the passed value is *not* undefined.',
  body: (x) => x != undefined
});

let is_string = defn({
  name: 'is_string',
  doc: 'Returns true if the passed value is a string.',
  body: (x) => typeof x === 'string'
});

let is_number = defn({
  name: 'is_number',
  doc: 'Returns true if the passed value is a number.',
  body: (x) => typeof x === 'number'
});

let is_int = defn({
  name: 'is_int',
  doc: 'Returns true if the value passed is an integer.',
  body: (x) => is_number(x) && x % 1 === 0
});

let is_bigint = defn({
  name: 'is_bigint',
  doc: 'Returns true if the passed value is a bigint.',
  body: (x) => typeof x === 'bigint'
});

let is_bool = defn({
  name: 'is_bool',
  doc: 'Returns true if the value passed is a boolean.',
  body: (x) => typeof x === 'boolean'
});

let is_symbol = defn({
  name: 'is_symbol',
  doc: 'Returns true if the value passed is a symbol.',
  body: (x) => typeof x === 'symbol'
});

let is_fn = defn({
  name: 'is_fn',
  doc: 'Returns true if the value passed is a function.',
  body: (x) => typeof x === 'function'
});

let is_obj = defn({
  name: 'is_obj',
  doc: 'Returns true if the value passed is an object. NB: All collections are objects: object literals, but also arrays, vectors, lists, etc.',
  body: (x) => x !== null && typeof x === 'object'
});

let is_assoc = defn({
  name: 'is_assoc',
  doc: 'Returns true if the value passed in is an associative object, holding values at string keys.',
  body: (x) => x != undefined && x.constructor === Object
});

let is_iter = defn({
  name: 'is_iter',
  doc: 'Returns true if the value passed in conforms to the JS iterable protocol.',
  body: (x) => x != undefined && typeof x[Symbol.iterator] === 'function'
});

let is_sequence = defn({
  name: 'is_sequence',
  doc: 'Returns true if the value passed in is a sequence: an iterable collection. (Strings are iterable, but they are not sequences.)',
  body: (x) => 
    x != undefined 
    && typeof x !== 'string' 
    && typeof x[Symbol.iterator] === 'function'
});

export {
  is_undef, is_some, 
  is_string, is_number, is_int, is_bigint, is_bool, is_symbol,
  is_fn, is_obj, is_assoc, is_iter, is_sequence,
};