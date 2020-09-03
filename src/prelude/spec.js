import './env.js';
import {bool, is_fn, is_sequence} from './predicates.js';
import {explain} from './functions.js';
import {method} from './methods.js';

let sign_to_pred = (...preds) => (...args) => {
  for (let i = 0; i < preds.length; i++) {
    if (!bool(preds[i](args[i]))) return false;
  }
  let rest = args.slice(preds.length);
  let last_pred = preds[preds.length - 1];
  for (let arg of rest) {
    if (!bool(last_pred(arg))) return false;
  }
  return true;
};

let sign_ = (...signs) => {
  let map = {};
  for (let sign of signs) {
    map[sign.length] = sign_to_pred(...sign);
  }
  let max_arity = Math.max(...signs.map(x => x.length));
  let sign = (...args) => {
    let arity = Math.min(args.length, max_arity);
    if (args.length in map)
      return map[arity](...args);
    return false;
  }
  return Object.assign(sign, {map, signs, [Symbol.for('ludus/explain')]: sign_});
};

let right_pad = (len, char = ' ') => (str) => str.length === len 
  ? str 
  : right_pad(len, char)(str + char);

right_pad(3)('f') //?

method(explain, sign_, (sign, args) => {
  let prn_sign = sign.map(Ludus.inspect);
  let prn_args = args.map(Ludus.inspect);
  let max_length = Math.max(
    ...prn_sign.map(x => x.length),
    ...prn_args.map(x => x.length))
  prn_sign = prn_sign.map();
});

/*
let is_sequence_of = defn({
  name: 'is_sequence_of',
  doc: 'Returns true if every value in the sequence passes the predicate. E.g., `is_sequence_of(is_number, [1, 2, 3]); //=> true`. If the sequence is supplied, returns a predicate function, e.g. `is_sequence_of(is_string)([42]); //=> false`.',
  pre: [sign_([is_fn], [is_fn, is_sequence])],
  body: [
    (pred) => partial(is_sequence_of, pred),
    (pred, sequence) => {
      let passes = true;
      for (let value of sequence) {
        passes = passes && bool(pred(value));
        if (!passes) return false;
      }
      return true;
    }
  ]
});

let splat = defn({
  name: 'splat',
  doc: 'Returns a variadic predicate function that returns true if every argument passed in passes (Ludus truthy) the `pred`. Useful for modeling splats in function signatures.',
  pre: [sign_([is_fn])],
  body: (pred) => (...args) => is_sequence_of(pred, args)
});

let sign = defn({
  name: 'sign',
  doc: 'Validate function arguments. Given a list of arrays of predicate functions, produces a predicate function that will validate the arguments according to the signatures. Arguments past the largest signature are ignored.',
  pre: [splat(is_sequence_of(is_fn))],
  body: sign_
});


export {sign, splat, is_sequence_of};

*/