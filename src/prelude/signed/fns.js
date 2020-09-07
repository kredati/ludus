//////////////////// Functions (signed)
// Functions on functions that aren't involved in signing,
// and signed versions of previously-unsigned functions

import L from './deps.js';
import P from './preds.js';
import { is_sequence } from '../unsigned/preds.js';

let {sign, splat} = L;
let {maybe, struct, is_string, is_fn, is_any, is_sequence_of, or, is_multi, is_some} = P;

// finally, a signed (and therefore safe-ish) `defn`
// TODO: improve this documentation
let defn = L.defn({
  name: 'defn',
  doc: 'Describes a Ludus function, which is an instrumented bare function. It dispatches on arity; has better and more informative error handling; allows for `pre` and `post` testing of arguments and returns; etc. It takes, minimally, an object with `name` and `body` fields. `name` must be a string; body must be a function or a sequence of functions describing clauses of various arities.',
  pre: sign([struct({
    name: is_string,
    doc: maybe(is_string),
    pre: maybe(or(is_fn, is_sequence_of(is_fn))),
    post: maybe(or(is_fn, is_sequence_of(is_fn))),
    body: or(is_fn, is_sequence_of(is_fn))
  })]),
  body: L.defn
});

let partial = defn({
  name: 'partial',
  doc: 'Partially applies a function. Takes a function and at least one argument to apply against the function when subsequent arguments are specified.',
  pre: sign([is_fn, is_any]),
  body: L.partial
});

let loop = defn({
  name: 'loop', 
  doc: 'Takes a function that is in tail-recursive form and eliminates tail calls, if the recursive calls are made using `recur` instead of the function name. Also allows for looping of anonymous functions.',
  pre: sign([is_fn]),
  body: L.loop
});

let recur = defn({
  name: 'recur', 
  doc: '`recur` is used within functions wrapped by `loop` to eliminate recursive tail calls. It will throw a variety of helpful errors if used in any other way, which can help identify when recursive calls are not in tail position.',
  body: L.recur
});

let fn = defn({
  name: 'fn', 
  doc: '`fn` is a convnience form of `defn`. It takes a string name and a function body or sequence of body clauses. It does not offer provisions for docstrings, nor for pre/post condition testing.',
  pre: sign([is_string, is_fn]),
  body: L.fn
});

let defmulti = defn({
  name: 'defmulti',
  doc: 'Defines a multimethod. Takes a description object, which, minimally includes a string `name` and a function `on`. `on` is the dispatch funciton: multimethods pass all objects to `on`, and whatever value they get back is used to determine which method to call. Equivalence uses `eq`. Optional: `pre`/`post` conditions, as well as `not_found`, which is the fallback function if there is no method for a particular value. Its default behavior is to throw an error.',
  pre: sign([struct({
    name: is_string,
    doc: maybe(is_string),
    on: is_fn,
    not_found: maybe(is_fn),
    pre: maybe(or(is_fn, is_sequence_of(is_fn))),
    post: maybe(or(is_fn, is_sequence_of(is_fn)))
  })]),
  body: L.defmulti
});

let defmethod = defn({
  name: 'defmethod',
  doc: 'Defines a method on a multimethod. Takes an object that, minimally, describes a multimethod, a value to match, and a body function. It optionally takes `pre` and `post` conditions.',
  pre: sign([struct({
    multi: is_multi,
    on: is_any,
    body: is_fn,
    pre: maybe(or(is_fn, is_sequence_of(is_fn))),
    post: maybe(or(is_fn, is_sequence_of(is_fn)))
  })]),
  body: L.defmethod
});

let methods = defn({
  name: 'methods', 
  doc: 'Returns an array of the methods on a multimethod. The array contains entries which are themselves arrays of two elements, `[on, method]`, where `on` is the matching value, and `method` is the function that corresponds to that value.',
  pre: sign([is_multi]),
  body: L.methods
});

let has_method = defn({
  name: 'has_method', 
  doc: 'Tells if a multimethod has a method for a particular value.',
  pre: sign([is_multi, is_any]),
  body: L.has_method
});

let get_method = defn({
  name: 'get_method', 
  doc: 'Given a multimethod and a value, retrieves the function that value, or `undefined`.',
  pre: sign([is_multi, is_any]),
  body: L.get_method
});

let dispatch_on = defn({
  name: 'dispatch_on',
  doc: 'Given a multimethod, retrieves the dispatching function.',
  pre: sign([is_multi]),
  body: L.dispatch_on
});

///// Other function functions
// Functions that manipulate functions

let never = Symbol('ludus/never');
let once = defn({
  name: 'once',
  doc: 'A function wrapped in `once` is run once, caches its result, and returns that result forever. It is useful for managing stateful constructs in a purely functional environment. (E.g., it is used in a crucial place in \'./seqs.js\' to make iterators "stateless.")',
  pre: sign([is_fn]),
  body: (fn) => {
    let result = never;
    return L.fn(fn.name, (...args) => {
      if (result === never) result = fn(...args);
      return result;
    });
  }
});

// thread :: (value, ...fn) -> value
// `thread`s a value through a series of functions, i.e. the value is passed
// to the first function, the return value is then passed ot the second,
// then the third, etc. Each fn must have an arity of 1.
let thread = defn({
  name: 'thread',
  doc: '`thread`s a value through a series of functions, i.e. the value is passed to the first function, the return value is then passed ot the second,then the third, etc. Each fn must have an arity of 1. The passed value must not be `undefined`.',
  pre: sign([is_some, is_fn]),
  body: (value, ...fns) => {
    let init = value;
    for (let fn of fns) {
      try {
        value = fn(value);
      } catch (e) {
        report(`Error threading ${init}.`);
        report(`${e.name} thrown while calling ${fn.name} with ${value.toString()}`);
        throw (e);
      }
    }
    return value;
  }
});

// thread_some :: (value, ...fn) -> value
// As `thread`, but short-circuits the thread on the first undefined return
// value.
let thread_some = defn({
  name: 'thread_some',
  doc: 'As `thread`, threading a value through a series of functions, but short-circuits on the first `undefined` return value, and returns `undefined`.',
  pre: sign([is_some, is_fn]),
  body: (value, ...fns) => {
    let init = value;
    for (let fn of fns) {
      try {
        value = fn(value);
        if (value == null) return undefined;
      } catch (e) {
        report(`Error threading ${init}.`);
        report(`${e.name} thrown while calling ${fn.name} with ${value.toString()}`);
        throw e;
      }
    }
    return value;
  }
});


let pipe = defn({
  name: 'pipe',
  doc: 'Creates a pipeline of unary functions, returning a unary function. Passes the argument to the first function, and then passes the return value of the first to the second function, and so on. The first value must not be undefined. Handles errors reasonably gracefully.',
  pre: splat(is_fn),
  body: (...fns) => defn({
    name: 'pipe',
    pipe: fns,
    pre: sign([is_some]),
    body: (value) => {
      let init = value;
      for (let fn of fns) {
        try {
          value = fn(value);
        } catch (e) {
          report(`Error in function pipeline called with ${init}.`)
          report(`${e.name} thrown while calling ${fn.name} with ${value.toString()}.`);
          throw e;
        }
      }
      return value;
    }
  })
});

// pipe_some :: (...fn) -> (value -> value)
// Builds a function pipeline, as `pipe`, that short circuits on the first
// undefined return value.
let pipe_some = defn({
  name: 'pipe_some',
  doc: 'Builds a function pipeline, as `pipe`, but short-circuits on the first undefined return value, and returns undefined.',
  pre: splat(is_fn),
  body: (...fns) => defn({
    name: 'pipeline/some',
    pipe: fns,
    body: (value) => {
      let init = value;
      for (let fn of fns) {
        try {
          value = fn(value);
          if (value == undefined) return undefined;
        } catch (e) {
          report(`Error in function pipeline called with ${init}.`)
          report(`${e.name} thrown while calling ${fn.name} with ${value.toString()}.`);
          throw e;
        }
      }
      return value;
    }
  })
});

let comp = defn({
  name: 'comp',
  doc: 'Composes functions, e.g. `comp(f, g)` is the same as `f(g(x))`. In other words, it builds a pipeline in reverse.',
  pre: splat(is_fn),
  body: (...fns) => {
    fns.reverse();
    return defn({
      name: 'composed',
      pre: sign([is_some]),
      pipe: fns,
      body: pipe(...fns)
    });
  }
});

let comp_some = defn({
  name: 'comp_some',
  doc: 'Composes functions, as `comp`, but short-circuits on the first `undefined` value.',
  pre: splat(is_fn),
  body: (...fns) => {
    fns.reverse();
    return defn({
      name: 'composed/some',
      pre: sign([is_some]),
      pipe: fns,
      body: pipe_some(...fns)
    })
  }
});

let Fn = L.ns({
  name: 'Fn',
  space: {
    defn, partial, loop, recur, fn,
    defmulti, defmethod, methods, has_method, get_method, dispatch_on, 
    once, thread, thread_some, pipe, pipe_some, comp, comp_some
  }
});

export default Fn;