//////////////////// Boolean value functions
// Replacements for !, ||, &&

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';

let {defn, partial} = F;
let {bool} = P;

let not = defn({
  name: 'not',
  doc: 'Boolean `not` (`!`) of a value. Deals in truthy and false, not literal `true` or `false`. E.g., `not(3) //=> false`.',
  body: (x) => !bool(x)
});

let and = defn({
  name: 'and',
  doc: 'Boolean `and` (`&&`) of values. With one argument, returns a function that is the `and` of its arguments with the original value. With two or more arguments, `and`s all the arguments. If an argument returns falsy (`undefined` or `false`), returns that value, and does not proceed further. Otherwise it returns the last value. Deals in truthy and falsy, not literal `true` or `false`. Short circuits on the first falsy value, but since all arguments are evaluated before being passed to `and`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(and, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      for (let x of xs) {
        if (not(x)) return x;
      }
      return xs[xs.length - 1];
    }
  ]
});

let or = defn({
  name: 'or',
  doc: 'Boolean `or` (`||`) of values. With one argument, returns a function that is the `or` of its arguments with the original value. With two or more arguments, `or`s all the arguments. Returns the first truthy value. If all values are falsy (`undefined` or `false`), returns the last argument. Deals in truthy and falsy, not literal `true` and `false`. Short-circuits on the first truthy value, but since all arguments are evaluted before being passed to `or`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(or, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      for (let x of xs) {
        if (bool(x)) return x;
      }
      return xs[xs.length - 1];
    }
  ]
});

let Bool = L.ns({
  name: 'Bool',
  space: { not, and, or }
});

export default Bool;