//////////////////// Errors
// helpers for better functional error handling

import Ludus from './base.js';

let {type, create} = Ludus.Type;

let error_t = type({name: 'Error'});

let error = (err) => {
  if (typeof err === 'string') {
    return create(error_t, {message: err});
  }
  let message = err?.message ?? 'unknown error';

  return create(error_t, {...err, message});
};

class LudusError extends Error {
  constructor(err) {
    let s = super(err.message);
    this.stack = s.stack;
    this.error = err;
    err.lerror = this;
  }
}

// raise :: (Error, string, ...strings) -> undefined
// functional error throwing
// throws `err` with `msg`, but first, it reports `msgs` to the error console
let raise = (err) => { throw new LudusError(error(err)); };

// bound :: fn -> fn
// converts a function that throws to one that returns its error
let bound = (fn) => Object.defineProperty(
  (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return e.error || e;
    }
  }, 'name', {value: fn.name || 'bounded'}
);

// handle :: fn -> fn
// wraps a function in a try/catch for more informative error handling
// sends some information to console.error
let handle = (name, fn) => Object.defineProperty(
  (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      e.lstack = e.lstack ?? [];
      let show_args = args.map((arg) => {
        try { return Ludus.show(arg); }
        catch (_) { return arg; }
      });
      e.lstack.push(`    ${name}(${show_args.join(', ')})`);
      throw e;
    }
  },
  'name',
  {value: name || fn.name || 'anon. fn'}
);

export default Ludus.NS.ns({type: error_t, members: {
  raise, bound, handle
}});
