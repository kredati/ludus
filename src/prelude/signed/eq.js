//////////////////// Equality
// Equality is much harder than it sounds, not only algorithmically,
// but also metaphysically.

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';

let {defn, partial} = F;
let {is_sequence, is_assoc, is_some} = P;

let is_identical = defn({
  name: 'is_identical',
  doc: 'Returns true if two values are reference-identical (JS `===`). This is a much faster operation than `eq`, but may give unintuitive answers. `[1, 2, 3]` is not `identical` to `[1, 2, 3]`.',
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
  
  For collections, it tries to a few tricks to be fast. When those fail: for associative collections, it tests for equality at each key; for sequential collections, it tests for equality in order. Testing the equality of large and/or nested collections should be done sparingly, since it may be quite slow. If you are testing for changes in an immutable collection (e.g. arrays) you are working with, you may wish to use \`is_identical\` instead.`,
  body: [
    (x) => partial(eq, x),
    (x, y) => L.eq(x, y),
    (x, y, z, ...rest) => {
      let as = [y, z, ...rest];
      for (let a of as) {
        if (!eq(x, a)) return false;
      }
      return true;
    }
  ]
});

let Eq = L.ns({
  name: 'Eq',
  space: {
    is_identical,
    eq
  }
})

export default Eq;