//////////////////// Errors
///// Signed error functions

import L from './deps.js';
import Fn from './fns.js';
import Spec from './spec.js';
import NS from './ns.js';

let {defn} = Fn;
let {args, function: fn} = Spec;

// We can't wrap `raise` in a `defn`, because it won't throw errors properly (they gety `handle`d)
// Add `doc` metadata to raise.
L.Err.raise.doc = 'Raises an error: stops execution and sends a report. You may raise a simple message or a specific error. `raise("foo");` will report out "foo" to the console as an error. `raise(Error, "foo");` will also report out a stack trace (which may or may not be helpful). You may use any type of Error. (Indeed, you may use anything as the first argument to `raise` and the console will do its best to represent it as a message.) Any additional arguments will also be reported out to the console on their own lines.';

let bound = defn({
  name: 'bound',
  doc: 'Converts a function that raises an error to one that returns any errors.',
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
  members: {raise: L.Err.raise, bound}
});