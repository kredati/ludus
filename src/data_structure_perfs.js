import {List as L} from './immutable.js';
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

let push = (list, el) => list.push(el);

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
  let reduced = big.reduce(conj_l, L.empty());
  return [...reduced];
});
let time_f = () => time(() => {
  let reduced = big.reduce(push, List.of());
  return [...reduced];
})



/*
time_l();//=
time_m();//=
time_i();//=
time_f();//=
time_n();//?
*/

//////////////// Record vs. object creation
import {Record} from './record-tuple/record.js';

Record({foo: 42}) === Record({foo: 42}) //?

let random_int = (lower, upper) => Math.floor(Math.random() * (upper - lower)) + lower;

let random_string = (length) => {
  let str = '';
  for (let i = 0; i < length; i++) {
    let char = random_int(0, 2)
      ? random_int(97, 123)
      : random_int(65, 91);
    
    str += String.fromCharCode(char);
  }
  return str;
};

let random_value = () => random_string(random_int(3, 15));

let random_obj = () => {
  let num_elements = random_int(1, 5);
  let obj = {};
  for (let i = 0; i < num_elements; i++) {
    obj[random_value()] = random_value();
  }
  return obj;
};


let create_records = () => {
  big.map(() => Record(random_obj()));
};

let create_object_literals = () => {
  big.map(random_obj);
}



time(create_records) //?
time(create_object_literals) //?


//////// tuple perf
import {Tuple} from './record-tuple/tuple.js'; //?

/*time(() => {
  let reduced = big.reduce((tup, el) => tup.pushed(el), Tuple.from([]));
  return reduced;
}) //?
time(() => [...big, 'foo']) //? */