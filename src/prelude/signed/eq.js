import {defn, partial} from './functions.js';
import {is_sequence, is_assoc, is_some} from './predicates.js';

let is_identical = defn({
  name: 'is_identical',
  doc: 'Returns true if two values are reference-identical (JS ===). This is a much faster operation than `eq`, but may give unintuitive answers.',
  body: [
    (x) => partial(is_identical, x),
    (x, y) => x === y,
    (x, y, z, ...rest) => {
      let as = [y, z, ...rest];
      for (let a of as) {
        if (!is_identical(x, a)) return false;
      }
      return true;
    } 
  ]
});

let eq = defn({
  name: 'eq',
  doc: `Are two things the same? This function tries to answer that question.
  
  As you might guess, this algorithm is rather more complex that it might at first sound, and involves assumptions about the nature of things. For the most part, \`eq\` will give you the answers that you expect. 
  
  For atomic values (string, boolean, number, etc.), it's simple and returns quickly.
  
  For collections, it tries to a few tricks to be fast. When those fail: for associative collections, it tests for equality at each key; for sequential collections, it tests for equality in order. Testing the equality of large collections should be done sparingly, since it may be quite slow. If you are testing for changes in a collection you are working with, you may wish to use \`is_identical\` instead.`,
  body: [
    (x) => partial(eq, x),
    (x, y) => {
      if (x === y) return true;
      if (x == undefined) return y == undefined;
      if (is_sequence(x)) return eq_iter(x, y);
      if (is_assoc(x)) return eq_assoc(x, y);
      return false;
    },
    (x, y, z, ...rest) => {
      let as = [y, z, ...rest];
      for (let a of as) {
        if (!eq(x, a)) return false;
      }
      return true;
    }
  ]
});

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
// TODO: are there more clever optimizations?
let eq_assoc = (x, y) => {
  for (let key in x) {
    if (!eq(x[key], y[key])) return false;
  }
  let x_keys = Object.keys(x);
  let y_keys = Object.keys(y);
  if (x_keys.length !== y_keys.length) return false;

  return true;
};

export {is_identical, eq};