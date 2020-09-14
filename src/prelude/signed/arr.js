//////////////////// Arrays
// Functions for working with arrays
// The basic posture here is for all functions to take
// either JS arrays (JSAs) or Ludus immutable arrays (LIAs) 
// and return LIAs

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';
import A from './immutable_arr.js';
import M from './math.js';
import E from './eq.js';
import { splat } from '../unsigned/spec.js';

let {defn} = F;
let {sign} = L;
let {is_int, is_any, is_undef, is_string, is_key} = P;
let {is_natural, number} = M;
let {eq} = E;

let is_arr = defn({
  name: 'is_arr',
  doc: 'Tells whether something is an array. (Returns `true` for both JS arrays and for Ludus immutable arrays.)',
  body: (arr) => Array.isArray(arr) || A.is_arr(arr)
});

let is_index = defn({
  name: 'is_index',
  doc: 'Tells whether something is a valid index of an array.',
  body: (index) => {
    if (is_undef(index) || is_natural(index)) return true;
    if (is_string(index)) {
      number(index)
    }
    return false;
  }
});

let empty = defn({
  name: 'empty',
  doc: 'Returns an empty array.',
  body: () => A.empty()
});

let empty_ = defn({
  name: 'empty_',
  doc: 'Returns an empty mutable array. Use only when you know you need to optimize something. Used under the hood for optimizing reducers (e.g. `into`).',
  body: () => []
});

let arr = defn({
  name: 'arr',
  doc: 'Takes its list of arguments and returns an array containing the arguments as elements, in order.',
  body: A.of
});

let from = defn({
  name: 'from',
  doc: 'Takes an iterable and returns an array containing the iterable\'s elements.',
  pre: sign([P.is_iter]),
  body: A.from
});

let concat = defn({
  name: 'concat',
  doc: 'Concatenates two or more arrays.',
  pre: splat(is_arr),
  body: (first, ...rest) => {
    let out = from(first);
    for (let arr of rest) {
      out = out.concat(from(arr));
    }
    return out;
  }
});

let conj = defn({
  name: 'conj',
  doc: 'Takes an array and a list of elements and adds those elements to the array.',
  pre: sign([is_arr, is_any]),
  body: [
    (arr, x) => A.from(arr).conj(x),
    (arr, x, y, ...more) => A.from(arr).conj(x).conj(y).concat(more)
  ]
});

let conj_ = defn({
  name: 'conj_',
  doc: 'Mutating `conj`: takes a JS array and adds an element to it, mutating it. Returns the mutated array.',
  pre: sign([Array.isArray, is_any]),
  body: (arr, x) => (arr.push(x), arr)
});

let unconj = defn({
  name: 'unconj',
  doc: 'Takes an array and returns a new array that omits the last element of the original array. Given an empty array, returns an empty array.',
  pre: sign([is_arr]),
  body: (arr) => A.from(arr).unconj()
});

let slice = defn({
  name: 'slice',
  doc: 'Takes an array, a starting index, and an optional stopping index. Returns a new array that contains the elements of the original array from the start index (inclusive) to the stop index (exclusive).',
  pre: sign([is_arr, is_natural], [is_arr, is_natural, is_int]),
  body: [
    (arr, start) => A.from(arr).slice(start),
    (arr, start, stop) => A.from(arr).slice(start, stop)
  ]
});

let assoc = defn({
  name: 'assoc',
  doc: 'Takes an array, an index, and a value, and sets the element at the index to the value. If the index is out of range (i.e., greater than or equal to the size of the array), it returns the array unchanged.',
  pre: sign([is_arr, is_natural, is_any]),
  body: (arr, index, value) => A.from(arr).update(index, value)
});

let index_of = defn({
  name: 'index_of',
  doc: 'Takes an array and a value and returns the first index where the element `eq`s the value. If the value is not in the array, returns `undefined`.',
  pre: sign([is_arr, is_any]),
  body: (arr, value) => {
    let size = arr.length || arr.size;
    for (let i = 0; i < size; i++) {
      if (eq(arr[i], value)) return i;
    }
    return undefined;
  }
});

let last_index_of = defn({
  name: 'last_index_of',
  doc: 'Takes an array and a value and returns the last index where the element `eq`s the value. If the value is not in the array, returns `undefined`.',
  pre: sign([is_arr, is_any]),
  body: (arr, value) => {
    let size = arr.length || arr.size;
    for (let i = size - 1; i >= 0; i--) {
      if (eq(arr[i], value)) return i;
    }
    return undefined;
  }
});

let reverse = defn({
  name: 'reverse',
  doc: 'Reverses the order of an array.',
  pre: sign([is_arr]),
  body: (arr) => {
    let out = [];
    let size = arr.length || arr.size;
    for (let i = size - 1; i >= 0; i--) {
      console.log(i)
      out.push(arr[i]);
    }
    return from(out);
  }
});

// TODO: improve this doc
// TODO: provide useful sorting functions?
let sort = defn({
  name: 'sort',
  doc: 'Sorts the elements of the array, returning a new array with elements sorted. Takes an optional comparison function. The sorting, `compare(x, y)` should return a numerical value less than zero if x is less than y; 0 if they are equal; and a value greater than 0 if x is greater than y. If no function is passed, all elements are converted to strings and compared according to Unicode values.', 
  pre: sign([is_arr]),
  body: [
    (arr) => from([...arr].sort()),
    (arr, compare) => from([...arr].sort(compare))
  ]
});

let Arr = L.ns({
  name: 'Arr',
  space: {
    arr, assoc, concat, conj, conj_, empty, empty_, from,
    index_of, is_arr, is_index, last_index_of, reverse,
    slice, sort, unconj
  }
});

export default Arr;
