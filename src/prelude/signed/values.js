//////////////////// Values, or doing stuff with things
// The functions collected here are a complete set of
// functions that replace infix operations in JS

import L from './deps.js';
import P from './preds.js';
import F from './fns.js';
import { splat } from '../unsigned/spec.js';

let {sign, partial} = L;
let {defn} = F;
let {bool, is_string, is_number, is_int} = P;

///// Booleans
let not = defn({
  name: 'not',
  doc: 'Boolean `not` (`!`) of a value. Deals in truthy and false, not literal `true` or `false`. E.g., `not(3) //=> false`.',
  body: (x) => !bool(x)
});

let and = defn({
  name: 'and',
  doc: 'Boolean `and` (`&&`) of values. With one argument, returns a function that is the `and` of its arguments with the original value. With two or more arguments, `and`s all the arguments. Deals in truthy and falsy, not literal `true` or `false`. Short-circuits on the first falsy value, but since all arguments are evaluated before being passed to `and`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(and, x),
    (x, y) => bool(x) && bool(y),
    (x, y, z, ...more) => {
      let xs = [x, y, z, ...more];
      for (let x of xs) {
        if (not(x)) return false;
      }
      return true;
    }
  ]
});

let or = defn({
  name: 'or',
  doc: 'Boolean `or` (`||`) of values. With one argument, returns a function that is the `or` of its arguments with the original value. WIth two or more arguments, `or`s all the arguments. Deals in truthy and falsy, not literal `true` and `false`. Short-circuits on the first truthy value, but since all arguments are evaluted before being passed to `or`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(or, x),
    (x, y) => bool(x) || bool(y),
    (x, y, z, ...more) => {
      let xs = [x, y, z, ...more];
      for (let x of xs) {
        if (bool(x)) return true;
      }
      return false;
    }
  ]
});

let Bool = L.ns({
  name: 'Bool',
  space: { not, and, or }
});

///// Numbers
// Arithmetic, random numbers, etc.
let add = defn({
  name: 'add',
  pre: splat(is_number),
  body: [
    (x) => partial(add, x),
    (x, y) => x + y,
    (x, y, z, ...more) => {
      let xs = [x, y, z, ...more];
      let sum = 0;
      for (let x of xs) {
        sum += x;
      }
      return sum;
    }
  ]
});

let mult = defn({
  name: 'mult',
  pre: splat(is_number),
  body: [
    (x) => partial(mult, x),
    (x, y) => x * y,
    (x, y, z, ...more) => {
      let xs = [x, y, z, ...more];
      let product = 1;
      for (let x of xs) {
        product *= x;
      }
      return product;
    }
  ]
});

let sub = defn({
  name: 'sub',
  pre: splat(is_number),
  body: [
    (x) => partial(sub, x),
    (x, y) => x - y,
    (x, y, z, ...more) => {
      let ys = [y, z, ...more];
      return sub(x, add(...ys));
    }
  ]
});

let is_nonzero = defn({
  name: 'is_nonzero',
  doc: 'Tells if a number is not zero.',
  pre: sign([is_number]),
  body: (x) => is_number(x) && x !== 0
});

let div = defn({
  name: 'div',
  pre: sign([is_number], [is_number, is_nonzero]),
  body: [
    (x) => partial(div, x),
    (x, y) => x / y,
    (x, y, z, ...more) => {
      let ys = [y, z, ...more];
      return div(x, mult(...ys));
    }
  ]
});

let random = defn({
  name: 'random',
  pre: sign([], [is_number], [is_number, is_number]),
  body: [
    () => Math.random(),
    (x) => Math.random() * x,
    (x, y) => (Math.random() * (y - x)) + x
  ]
});

let ceil;

let floor;

let round;

let random_int;

let mod;

let pow;

let gt;

let gte;

let lt;

let lte;

let is_positve;

let is_positive_int;

let is_natural;

let is_negative;

let number;

///// Strings
// String manipulations, excepting regexes because ugh regexes
let string;

let concat = defn({
  name: 'concat',
  doc: 'Concatenates strings togheter, returning a new string made up of each argument in order.',
  pre: splat(is_string),
  body: [
    () => '',
    (x) => x,
    (x, y) => x + y,
    (x, y, z, ...more) => x.concat(y, z, ...more)
  ]
});

let split = defn({
  name: 'split',
  doc: 'Splits a string into substrings, using a separator that is also a string. Returns an array of strings. With one argument, returns a function that splits strings using the argument as a separator. With two arguments, splits the second string using the first as the separator.',
  pre: sign([is_string], [is_string, is_string]),
  body: [
    (sep) => partial(split, sep),
    (sep, str) => str.split(sep)
  ]
});

let is_blank = defn({
  name: 'is_blank',
  doc: 'Tells if a string is nothing but whitespace (spaces, newlines, tabs, etc.).',
  pre: sign([is_string]),
  body: (str) => str.trim() === ''
});

let is_empty = defn({
  name: 'is_empty',
  doc: 'Tells if a string is the empty string.',
  pre: sign([is_string]),
  body: (str) => str === ''
});

let trim = defn({
  name: 'trim',
  doc: 'Trims all preceding and trailing whitespace from a string. E.g., `trim(\'    foo  \'); //=>  \'foo\'`.',
  pre: sign([is_string]),
  body: (str) => str.trim()
});

let trim_left = defn({
  name: 'trim_left',
  doc: 'Trims whitespace from the beginning of a string.',
  pre: sign([is_string]),
  body: (str) => str.trimStart()
});

let trim_right = defn({
  name: 'trim_right',
  doc: 'Trims whitespace from the end of a string.',
  pre: sign([is_string]),
  body: (str) => str.trimEnd()
});

let index_of;

let last_index_of;

let upcase;

let lowcase;

let words;

let replace;

let replace_first;

let size;

let from_code;

let code_at;

let char_at;

let ends_with;

let includes;

let pad_left;

let pad_right;

let slice;


