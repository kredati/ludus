//////////////////// Spec
// A first, simple pass at a protocol/method for validating function
// inputs, to allow for simple signing of functions before we bootstrap
// a parser-based DSL (which will largely mirror this).
// Exports three functions: `sign` and `splat` (modeling function signatures),
// and a helper function, `is_sequence_of`.
// * `sign` mocks an explicit, fixed arity function signature
// * `splat` mocks splat function signatures
// At current, they cannot be mixed. That said, `sign` applies the last
// predicate in the longest signature to any excess arguments,
// allowing for splats. (More below.)
// `sign` and `splat` also add methods to `explain`, to get good reasonable
// representations of why arguments fail.

import Ludus from './env.js';
import {bool, is_fn, is_sequence, is_any, is_undef} from './preds.js';
import {partial, explain, defn, defmethod, fn} from './fns.js';

// sign_to_pred :: (...fns) -> pred
// Takes an array of predicates and returns a function
// that applies the predicate to the corresponding argument
// It also applies the last predicate past in to any arguments
// beyond the length of the predicate array
// note the use of `bool` to ensure proper Ludus truthity and falsity
// Preds don't actually have to be predicates, returning `true` or `false` 
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

// sign_ :: (...[pred]) -> pred
// An internal, unsigned sign function. (Signed version below.)
// Takes a list of signs--arrays of predicates--and returns a single
// predicate function, along with some metadata.
let sign_ = (...signs) => {
  // A map for arity -> predicate
  let pred_map = {};
  // A map for arity -> sign
  let sign_map = {};
  for (let sign of signs) {
    pred_map[sign.length] = sign_to_pred(...sign);
    sign_map[sign.length] = sign;
  }
  // Figure out the max arity
  let max_arity = Math.max(...signs.map(x => x.length));
  let sign = (...args) => {
    // Select the predicate for the proper arity
    // Anything longer than the longest sign gets sent to the 
    // the longest sign
    let arity = Math.min(args.length, max_arity);
    let pred = pred_map[arity];
    // If we don't have a predicate function, the arguments don't pass
    return is_undef(pred) ? false : pred(...args);
  }
  return Object.assign(sign, {map: pred_map, signs: sign_map, explain: sign_});
};

// A helper function
let right_pad = (len, char = ' ') => (str) => {
  str = str + '';
  if (char.length === 0) return str;
  while (str.length < len) {
    str += char;
  }
  return str;
};

// A complex parsing function that offers a representation of why a set of
// args has not passed a signature predicate function.
let fail_sign = (sign, args) => {
  let min_arity = Math.min(...Object.keys(sign.signs));
  let max_arity = Math.max(...Object.keys(sign.signs));
  if (args.length < min_arity)
    return `Not enough arguments. I was expecting at least ${min_arity}, but received ${args.length}: ( ${Ludus.show(args)} )`;
  let arity = Math.min(max_arity, args.length);
  let the_sig = sign.signs[arity];
  if (the_sig === undefined) {
    return `Wrong number of arguments: I have no arity of ${args.length}.`
  }
  if (args.length > arity) {
    let last_pred = the_sig[the_sig.length - 1];
    the_sig = [
      ...the_sig,
      ...Array(args.length - arity).fill(last_pred)
    ]
  }
  let prn_sign = the_sig.map((fn) => fn.name);
  let prn_args = args.map(Ludus.show);
  let status = [];
  for (let i = 0; i < args.length; i++) {
    let which_sign = Math.min(i, arity - 1);
    let pass = bool(sign.signs[arity][which_sign](args[i]));
    status.push(pass ? 'pass' : 'fail');
  }
  let max_length = Math.max(
    ...prn_sign.map(x => x.length),
    ...prn_args.map(x => x.toString().length),
    ...status.map(x => x.length));
  prn_sign = prn_sign.map(right_pad(max_length)).join(', ');
  prn_args = prn_args.map(right_pad(max_length)).join(', ');
  let prn_status = status.map(right_pad(max_length)).join(', ');
  return `sign: ( ${prn_sign} )\nargs: ( ${(prn_args)} )\npass? ( ${prn_status} )`;
};

// The above function is installed as a method for `explain`
// If a signature was built using `sign_`, it will dispatch
// to `fail_sign` when passed to `explain`.
defmethod({
  multi: explain,
  on: sign_,
  body: fail_sign
});

// A useful predicate for `splat`
// Also, our very first signed function
let is_sequence_of = defn({
  name: 'is_sequence_of',
  doc: 'Returns true if every value in the sequence passes the predicate. E.g., `is_sequence_of(is_number, [1, 2, 3]); //=> true`. If the sequence is supplied, returns a predicate function, e.g. `is_sequence_of(is_string)([42]); //=> false`.',
  // Note the two signs here, that correspond to the two clauses of the body
  pre: sign_([is_fn], [is_fn, is_any]),
  body: [
    (pred) => fn(`is_sequence_of(${pred.name})`, partial(is_sequence_of, pred)),
    (pred, sequence) => {
      if (!is_sequence(sequence)) return false;
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
  pre: sign_([is_fn]),
  body: (pred) => defn({
    name: `splat<${pred.name || pred.toString()}>`,
    explain: splat,
    pred,
    body: (...args) => is_sequence_of(pred, args)
  })
});

defmethod({
  multi: explain,
  on: splat,
  body: (splat, args) => {
    let fails = args.reduce((fails, arg, i) => {
      if (!splat.pred(args[i])) {
        fails[i] = Ludus.show(arg);
      }
      return fails;
    }, {});
    let prn_fails = Object.entries(fails).map(([key, fail]) => `${key}: ${fail}`).join(',\n');
    return `Some arguments did not pass ${Ludus.show(splat.pred)} [position, value]:\n${prn_fails}`;
  }
});

let sign = defn({
  name: 'sign',
  doc: `Validate function arguments. Given a list of arrays of predicate functions, produces a predicate function that will validate the arguments according to the signatures. Arguments past the largest signature are evaluated using the last predicate.
  
  This allows \`sign\` to model function signatures that end with "rest" arguments. This is the default option. If you wish to sign a function that truly ignores any arguments above the highest arity signature, include a signature that is the same as the highest arity signature, adding \`is_any\` at the end.`,
  pre: splat(is_sequence_of(is_fn)),
  body: (...preds) => sign_(...preds)
});

defmethod({
  multi: explain,
  on: sign,
  body: fail_sign
});

export {sign, splat, is_sequence_of};
