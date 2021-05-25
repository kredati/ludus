//////////////////// eq
// An algorithm for more intuitive, value-based equality

// Because of Ludus's approach to state and purity, it makes a great
// deal more sense for equality to be value-based rather than
// reference-based. We want `eq([1, 2, 3], [1, 2, 3]); //=> true`, but
// `[1, 2, 3] === [1, 2, 3]; //=> false`. Same for objects.

// At current, the algorithm below only does value-based equality for
// object literals and anything that has an iterator, everything else
// that isn't an atom is compared using reference-based equality.
// We probably want to allow for user-defined behavior?--an `eq` method?

// TODO:
// [ ] dispatch to `eq` method if it exists, maybe?
// [ ] what is the default behavior for Ludus types?
// [ ] what to do when you've got two infinite sequences?
//     ^ at current it will hang
// [ ] optimize `eq_assoc` if possible

import Pred from './preds.js';
import L from './base.js';

let {is_sequence, is_assoc, is_some} = Pred;

let eq_ = L.defmethod({
  name: 'eq',
  not_found: () => false
});

let eq = (x, y) => {
  if (x === y) return true;
  if (x == undefined) return y == undefined;
  if (is_sequence(x) && is_sequence(y)) return eq_iter(x, y);
  if (is_assoc(x) && is_assoc(y)) return eq_assoc(x, y);
  return eq_(x, y);
};

// eq_iter is a helper function for `eq`
// it tests if two iterables are equal(ish), using `eq`
// to test each element in turn
let eq_iter = (xs, ys) => {
  // do a size check, if size info is available
  let x_size = xs.length != undefined ? xs.length : xs.size;
  let y_size = ys.length != undefined ? ys.length : ys.size;
  if (is_some(x_size) && is_some(y_size) &&
    x_size !== y_size) return false;

  // if our iterables are not sized, or if they are the same size, 
  // work through them manually
  // iterables are not necessarily indexed,
  // so we have to iterate through them manually
  // runs in O(1) in best case, and O(😱) in worst case
  // (Or, rather O(n * m), where m is the depth of the collections
  // held in each element.)
  let x_iter = xs[Symbol.iterator]();
  let y_iter = ys[Symbol.iterator]();
  let x = x_iter.next();
  let y = y_iter.next();
  while (!x.done && !y.done) {
    if (!eq(x.value, y.value)) return false;
    x = x_iter.next();
    y = y_iter.next();
  }
  if (x.done !== y.done) return false;

  return true;
};

// `eq_assoc` tests for equality between associative collections.
// Runs in O(1) best case, and O(😱) in worst case
// TODO: are there more clever optimizations?
let eq_assoc = (x, y) => {
  let x_keys = Object.keys(x);
  for (let key in x_keys) {
    if (!eq(x[key], y[key])) return false;
  }
  let y_keys = Object.keys(y);
  if (x_keys.length !== y_keys.length) return false;

  return true;
};

export {eq};
