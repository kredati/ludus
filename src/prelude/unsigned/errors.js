//////////////////// Errors
// helpers for better functional error handling

import Ludus from './base.js';

// raise :: (Error, string, ...strings) -> undefined
// functional error throwing
// throws `err` with `msg`, but first, it reports `msgs` to the error console
let raise = (err, ...msgs) => {
  if (err === Error || Object.getPrototypeOf(err) === Error) {
    if (msgs.length > 0) {
      for (let i = 1; i < msgs.length; i++) 
        Ludus.report(msgs[i]);
    };
    let thrown = new err(msgs[0]);
    if (thrown.stack) {
      let [msg, _, ...trace] = thrown.stack.split('\n');
      thrown.stack = [msg, ...trace].join('\n');
    }
    throw new err(msgs[0]);
  } 
  else {
    for (let msg of msgs) Ludus.report(msg);
    throw err;
  };
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
      Ludus.report(`${e.name || e || 'unknown error'} while calling ${fn.name || 'anon. fn'} with args (${args.map(arg => Ludus.show(arg)).join(', ')})`);
      throw e;
    }
  },
  'name',
  {value: name || fn.name || 'anon. fn'}
);

export default Ludus.NS.ns({name: 'Errors', members: {
  raise, bound, handle
}});