//////////////////// Errors
///// Signed error functions

import L from './deps.js';
import Fn from './fns.js';
import Spec from './spec.js';
import NS from './ns.js';
import Pred from './preds.js';
import Bool from './bools.js';

let {ns} = NS;
let {fn} = Fn;
let {args} = Spec;
let {is_fn} = Pred;

// We can't wrap `raise` in a `defn`, because it won't throw errors properly (they gety `handle`d)
// Add `doc` metadata to raise.
L.Err.raise.doc = 'Raises an error: stops execution and sends a report. You may raise a simple message or a specific error. `raise("foo");` will report out "foo" to the console as an error. `raise(Error, "foo");` will also report out a stack trace (which may or may not be helpful). You may use any type of Error. (Indeed, you may use anything as the first argument to `raise` and the console will do its best to represent it as a message.) Any additional arguments will also be reported out to the console on their own lines.';

// TODO: this really doesn't help very much; delete it
let bound = fn({
  name: 'bound',
  doc: 'Converts a function that raises an error to one that returns any errors.',
  pre: args([is_fn]),
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

let handle = fn({
  name: 'handle',
  doc: 'Execute a computation, and handle any errors arising from it (presumably gracefully). Takes two functions: `attempt`, a nullary function that includes the computation that might raise an error; and `on_error`, a unary function that receives (and presumably, handles) any errors. If the computation succeeds, returns the return value of `attempt`; if it fails, returns the return value of `on_error`.',
  pre: args([is_fn, is_fn]),
  body: (attempt, on_error) => {
    try {
      return attempt();
    } catch (e) {
      return on_error(e);
    }
  }
});

let assert = fn({
  name: 'assert',
  doc: 'Takes two arguments: an assertion and an error. If the assertion is truthy, returns it. If the assertion is falsy, it `raise`s the error.',
  body: (assertion, error) => Bool.bool(assertion) 
    ? assertion 
    : L.Err.raise(error)
});

export default ns({name: 'Error',
  members: {raise: L.Err.raise, bound, handle, assert}
});
