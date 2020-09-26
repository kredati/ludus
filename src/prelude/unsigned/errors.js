//////////////////// Errors
// helpers for better functional error handling
// TODO: also consider standard error types for Ludus

import Ludus from './base.js';

// raise :: (Error, string, ...strings) -> undefined
// functional error throwing
// throws `err` with `msg`, but first, it reports `msgs` to the error console
let raise = (err, msg, ...msgs) => {
  Ludus.report(msgs);
  throw new err(msg);
};

// bound :: fn -> fn
// converts a function that throws to one that returns its error
let bound = (fn) => Object.defineProperty(
  (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return e;
    }
  }, name, {value: fn.name || 'bounded'}
);

// handle :: fn -> fn
// wraps a function in a try/catch for more informative error handling
// sends some information to console.error
let handle = (name, fn) => Object.defineProperty(
  (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      Ludus.report(`${e.name} thrown while calling ${fn.name || 'anon. fn'} with arguments (${args.map(arg => arg.toString()).join(', ')})`);
      throw e;
    }
  },
  'name',
  {value: name || fn.name || 'anon. fn'}
);

export default Ludus.defns({name: 'Errors', members: {
  raise, bound, handle
}});