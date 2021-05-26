//////////////////// Errors
///// Signed error functions

import L from './deps.js';
import Fn from './fns.js';
import Spec from './spec.js';
import NS from './ns.js';

let {ns} = NS;
let {defn} = Fn;
let {args, fn} = Spec;

// We can't wrap `raise` in a `defn`, because it won't throw errors properly (they gety `handle`d)
// Add `doc` metadata to raise.
L.Err.raise.doc = 'Raises an error: stops execution and sends a report. You may raise a simple message or a specific error. `raise("foo");` will report out "foo" to the console as an error. `raise(Error, "foo");` will also report out a stack trace (which may or may not be helpful). You may use any type of Error. (Indeed, you may use anything as the first argument to `raise` and the console will do its best to represent it as a message.) Any additional arguments will also be reported out to the console on their own lines.';

// TODO: this really doesn't help very much; delete it
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

// TODO: decide which model to use
// TODO: Consider putting this in flow?

// this feels most Ludus-y: two functions
let handle_f = defn({
  name: 'handle',
  doc: 'Execute a computation, and handle any errors arising from it (presumably gracefully). Takes two functions: `attempt`, a nullary function that includes the computation that might raise an error; and `on_error`, a unary function that receives (and presumably, handles) any errors. If the computation succeeds, returns the return value of `attempt`; if it fails, returns the return value of `on_error`.',
  pre: args([fn, fn]),
  body: (attempt, on_error) => {
    try {
      return attempt();
    } catch (e) {
      return on_error(e);
    }
  }
});

// the Go model: return a tuple
// then you do `let [res, err] = handle(() => {...}); when(err) ? ...;`
let handle_tup = defn({
  name: 'handle',
  pre: args([fn]),
  body: (attempt) => {
    let result;
    let error;
    try {
      result = attempt();
    } catch (e) {
      error = e;
    }
    return [result, error];
  }
});

// and finally, a monad
// I really, really don't want monads in Ludus, though:
// they have a tendency to propagate, and are only really useful
// in a strictly, statically typed language
import Type from './type.js';

let result_t = Type.deftype({name: 'Result'});

let ok = (value) => Type.create(result_t, {value, result: ok});

let err = (value) => Type.create(result_t, {value, result: err});

let is_ok = (res) => res.result === ok;

let is_err = (res) => res.result === err;

let handle_monad = (attempt) => {
  try {
    return ok(attempt);
  } catch (e) {
    return err(e);
  }
};

export default ns({name: 'Error',
  members: {raise: L.Err.raise, bound, handle: handle_f}
});
