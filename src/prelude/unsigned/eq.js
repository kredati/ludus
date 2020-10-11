import Pred from './preds.js';

let {is_sequence, is_assoc, is_some} = Pred;

let eq = (x, y) => {
  if (x === y) return true;
  if (x == undefined) return y == undefined;
  if (is_sequence(x)) return eq_iter(x, y);
  if (is_assoc(x)) return eq_assoc(x, y);
  return false;
};

// eq_iter is a helper function for `eq`
// it tests if two iterables are equal(ish), using `eq`
// to test each element in turn
let eq_iter = (xs, ys) => {
  // do a size check, if size info is available
  let x_size = xs.length || xs.size;
  let y_size = ys.length || ys.size;
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
// Returns false if two objects do not have the same constructor
// or prototype.
// TODO: are there more clever optimizations?
let eq_assoc = (x, y) => {
  if (x.constructor !== y.constructor) return false;
  if (Reflect.getPrototypeOf(x) !== y.getPrototypeOf(y)) return false;
  for (let key in x) {
    if (!eq(x[key], y[key])) return false;
  }
  let x_keys = Object.keys(x);
  let y_keys = Object.keys(y);
  if (x_keys.length !== y_keys.length) return false;

  return true;
};

export {eq};