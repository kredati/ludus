//////////////////// Functions (signed)
// Functions on functions that aren't involved in signing,
// and signed versions of previously-unsigned functions

import Ludus from './deps.js';

let Fn = Ludus.Fn;

let {record, maybe, string, seq, or, and, any, some, type, Spec, args, not_empty} = Ludus.Spec;
let func = Ludus.Spec.function;

let test = or(func, type(Spec));
let pre_post = maybe(or(test, seq(test)));

let fn_descriptor = record('fn_descriptor', {
  name: string,
  doc: maybe(string),
  pre: pre_post,
  post: pre_post,
  body: or(func, and(not_empty, seq(func))) 
});

// finally, a signed (and therefore safe-ish) `defn`
// TODO: improve this documentation
let defn = Fn.defn({
  name: 'defn',
  doc: 'Describes a Ludus function, which is an instrumented bare function. It dispatches on arity; has better and more informative error handling; allows for `pre` and `post` testing of arguments and returns; etc. It takes, minimally, an object with `name` and `body` fields. `name` must be a string; body must be a function or a sequence of functions describing clauses of various arities.',
  pre: args([fn_descriptor]),
  body: Fn.defn
});

let partial = defn({
  name: 'partial',
  doc: 'Partially applies a function. Takes a function and at least one argument to apply against the function when subsequent arguments are specified.',
  pre: args([func, any]),
  body: Fn.partial
});

let loop = defn({
  name: 'loop', 
  doc: 'Takes a function that is in tail-recursive form and eliminates tail calls, if the recursive calls are made using `recur` instead of the function name. Also allows for looping of anonymous functions.',
  pre: args([func]),
  body: Fn.loop
});

let recur = defn({
  name: 'recur', 
  doc: '`recur` is used within functions wrapped by `loop` to eliminate recursive tail calls. It will throw a variety of helpful errors if used in any other way, which can help identify when recursive calls are not in tail position.',
  body: Fn.recur
});

let fn = defn({
  name: 'fn', 
  doc: '`fn` is a convnience form of `defn`. It takes a string name and a function body or sequence of body clauses. It does not offer provisions for docstrings, nor for pre/post condition testing.',
  pre: args([string, func]),
  body: Fn.fn
});

///// Other function functions
// Functions that manipulate functions

let never = Symbol('ludus/never');
let once = defn({
  name: 'once',
  doc: 'A function wrapped in `once` is run once, caches its result, and returns that result forever. It is useful for managing stateful constructs in a purely functional environment. (E.g., it is used in a crucial place in \'./seqs.js\' to make iterators "stateless.")',
  pre: args([func]),
  body: (fn) => {
    let result = never;
    return Fn.fn(fn.name, (...args) => {
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
  pre: args([some, func]),
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
  pre: args([some, func]),
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
  pre: seq(func),
  body: (...fns) => defn({
    name: 'pipe',
    pipe: fns,
    pre: args([some]),
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
  pre: seq(func),
  body: (...fns) => defn({
    name: 'pipeline/some',
    pipe: fns,
    pre: args([some]),
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
  pre: seq(func),
  body: (...fns) => {
    fns.reverse();
    return defn({
      name: 'composed',
      pre: args([some]),
      pipe: fns,
      body: pipe(...fns)
    });
  }
});

let comp_some = defn({
  name: 'comp_some',
  doc: 'Composes functions, as `comp`, but short-circuits on the first `undefined` value.',
  pre: seq(func),
  body: (...fns) => {
    fns.reverse();
    return defn({
      name: 'composed/some',
      pre: args([some]),
      pipe: fns,
      body: pipe_some(...fns)
    })
  }
});

export default Ludus.NS.defmembers(Fn, {
    defn, partial, loop, recur, fn,
    once, thread, thread_some, pipe, pipe_some, comp, comp_some
});
