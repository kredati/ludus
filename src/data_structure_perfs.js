import {List} from './immutable.js';

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

let naive = (arr, el) => [...arr, el];
let mut = (arr, el) => {
  arr.push(el);
  return arr;
};

let cons = (el, list = {}) => {
  return {
    [Symbol.iterator] () {
      let first = el;
      let rest = list;
      return {
        next () {
          let out = first;
          if (out === undefined) return {done: true};
          first = rest.first;
          rest = rest.rest;
          return {value: out};
        },
      }
    },
    first: el,
    rest: list
  }
};

let conj = (list, el) => cons(el, list);

let list = (...args) => args.reduceRight(conj, {});
[...list(1, 2, 3)]; //=

let conj_l = (list, el) => list.conj(el);

let time_n = () => time(() => {
  let reduced = big.reduce(naive, []);
  return [...reduced];
});
let time_l = () => time(() => {
  let reduced = big.reduce(conj, {});
  return [...reduced];
});
let time_m = () => time(() => {
  let reduced = big.reduce(mut, []);
  return [...reduced];
});
let time_i = () => time(() => {
  let reduced = big.reduce(conj_l, List.empty());
  return [...reduced];
});

time_l();//=
time_m();//=
time_i();//=