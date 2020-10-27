//////////////////// Errors
///// Signed error functions

import L from './deps.js';
import Fn from './fns.js';
import Spec from './spec.js';
import NS from './ns.js';

let {defn} = Fn;
let {args, defspec, string, function: fn} = Spec;

let error = defspec({name: 'error', pred: (x) => x instanceof Error});

let raise = defn({
  name: 'raise',
  doc: 'Raises an error: stops execution and reports an error.',
  pre: args([error, string]),
  body: L.Err.raise
});

let bound = defn({
  name: 'bound',
  doc: 'Converts a function that throws or raises an error to one that returns any errors.',
  pre: args([fn]),
  body: (fn) => Fn.fn(fn.name + '<bounded>', 
    (...args) => {
      try {
        return fn(...args);
      } catch (e) {
        return e;
      }
    }
  )
});

// TODO: do we really need `handle`? All `fn` and `defn` functions are handled. No user should ever have to call this.

export default NS.defns({name: 'Error',
  members: {raise, bound}
});