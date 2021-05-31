//////////////////// Arrays
// Functions for working with arrays
// The basic posture here is for all functions to take
// either JS arrays (JSAs) or Ludus immutable arrays (LIAs) 
// and return LIAs

import L from './deps.js';
import P from './preds.js';
import S from './spec.js';
import NS from './ns.js';
import './fns.js';
import './nums.js';

import A from './arr_immutable.js';

let {ns} = NS;
let {defn} = L.Fn;
let {args, seq, arr, int, any, iter, fn} = S;
let {is_natural, num} = L.Num;
let {eq} = L;

let is_index = defn({
  name: 'is_index',
  doc: 'Tells whether something is a valid index of an array.',
  body: (index) => {
    if (!(P.is_key(index))) return false;
    return is_natural(num(index));
  }
});

let index = S.defspec({name: 'index', pred: is_index});

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

let _arr = defn({
  name: 'arr',
  doc: 'Takes its list of arguments and returns an array containing the arguments as elements, in order.',
  body: A.of
});

let from = defn({
  name: 'from',
  doc: 'Takes an iterable and returns an array containing the iterable\'s elements.',
  pre: seq(iter),
  body: A.from
});

let concat = defn({
  name: 'concat',
  doc: 'Concatenates an array with zero or more iterables.',
  pre: args([arr], [arr, iter]),
  body: (...iters) => {
    let out = [];
    for (let xs of iters) {
      for (let x of xs) {
        out.push(x);
      }
    }
    return from(out);
  }
});

let conj = defn({
  name: 'conj',
  doc: 'Takes an array and a list of elements and adds those elements to the array.',
  pre: args([arr, any]),
  body: [
    (arr, x) => A.from(arr).conj(x),
    (arr, x, y, ...more) => A.from(arr).conj(x).conj(y).concat(more)
  ]
});

let conj_ = defn({
  name: 'conj_',
  doc: 'Mutating `conj`: takes a JS array and adds an element to it, mutating it. Returns the mutated array.',
  pre: args([Array.isArray, any]),
  body: (arr, x) => (arr.push(x), arr)
});

let unconj = defn({
  name: 'unconj',
  doc: 'Takes an array and returns a new array that omits the last element of the original array. Given an empty array, returns an empty array.',
  pre: args([arr]),
  body: (arr) => A.from(arr).unconj()
});

let slice = defn({
  name: 'slice',
  doc: 'Takes an array, a starting index, and an optional stopping index. Returns a new array that contains the elements of the original array from the start index (inclusive) to the stop index (exclusive).',
  pre: args([arr, index], [arr, index, int]),
  body: [
    (arr, start) => A.from(arr).slice(start),
    (arr, start, stop) => A.from(arr).slice(start, stop)
  ]
});

let assoc = defn({
  name: 'assoc',
  doc: 'Takes an array, an index, and a value, and sets the element at the index to the value. If the index is out of range (i.e., greater than or equal to the size of the array), it returns the array unchanged.',
  pre: args([arr, index, any]),
  body: (arr, index, value) => A.from(arr).update(index, value)
});

let index_of = defn({
  name: 'index_of',
  doc: 'Takes an array and a value and returns the first index where the element `eq`s the value. If the value is not in the array, returns `undefined`.',
  pre: args([arr, any]),
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
  pre: args([arr, any]),
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
  pre: args([arr]),
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
  doc: 'Sorts the elements of the array, returning a new array with elements sorted. Takes an optional comparison function. The sorting, `compare(x, y)` should return a numerical value less than zero if x is less than y; 0 if they are equal; and a value greater than 0 if x is greater than y. E.g., to sort numbers in ascending order, `sort([2, 1, 4, 0], sub) //=> [0, 1, 2, 4]`. To sort numbers in descending order: `sort([2, 1, 4, 0], (x, y) => y - x) //=> [4, 2, 1, 0]`. If no function is passed, all elements are converted to strings and compared according to Unicode values, which can lead to some unexpected results. E.g., `sort([10, 9, 1, 32]) //=> [1, 10, 32, 9]`.', 
  pre: args([arr], [arr, fn]),
  body: [
    (arr) => from([...arr].sort()),
    (arr, compare) => from([...arr].sort(compare))
  ]
});

export default ns(L.Arr, {
  arr: _arr, assoc, concat, conj, conj_, empty, empty_, from,
  index, index_of, is_index, last_index_of, reverse,
  slice, sort, unconj
});
