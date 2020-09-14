import {Arr} from './prelude/signed/immutable_arr.js';
import {List} from 'immutable';

// lessons from the below
// 1. Using generators is fast--nearly instant, and lets you build arbitrariliy large data structures--but then you get a stack overflow when you try to access them.
// 2. Naive copying has better performance than immer (what?)
//  (immer code deleted)
// 3. Prototype-based conjing has better performance than Naive when adding a thing to an already-big array, but terrible performance when building a large array.

let time = (fn) => {
  let start = Date.now();
  fn();
  let end = Date.now();
  return end - start;
};

let big = Array.from(Array(10000), (_, i) => i);


let mut = (arr, el) => (arr.push(el), arr);

let conj = (arr, el) => arr.conj(el);

let push = (arr, el) => arr.push(el);


let time_m = () => time(() => {
  let reduced = big.reduce(mut, []);
  return [...reduced];
});
let time_i = () => time(() => {
  let reduced = big.reduce(conj, Arr.empty());
  return [...reduced];
});
let time_f = () => time(() => {
  let reduced = big.reduce(push, List.of());
  return [...reduced];
});




time_m();//?
time_i();//?
time_f();//?

