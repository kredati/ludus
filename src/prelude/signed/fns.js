//////////////////// Functions (signed)
// Functions on functions that aren't involved in signing,
// and signed versions of previously-unsigned functions

import Ludus from './deps.js';
import Spec from './spec.js';
import NS from './ns.js';

let Fn = Ludus.Fn;
let {report} = Ludus;
let {ns} = NS;

let {record, maybe, or, and, args, iter_of} = Spec;
let {is_str, is_any, is_some, is, is_not_empty, is_fn, is_sequence} = Ludus.Pred;

let {fn: fn_, defn: defn_} = Fn;

let test = or(is_fn, is(Spec.t)); // specs valid tests: a function or a spec
let pre_post = maybe(or(test, iter_of(test))); // pre or post tests are optional, and either tests or sequences of tests

// spec a function descriptor
let fn_descriptor = record('fn_descriptor', {
  name: is_str,
  doc: maybe(is_str),
  pre: pre_post,
  post: pre_post,
  body: or(is_fn, and(is_not_empty, iter_of(is_fn))) 
});

// finally, a signed (and therefore safe-ish) `defn`
// TODO: improve this documentation
let fn = Fn.defn({
  name: 'fn',
  doc: 'Describes a Ludus function, which is an instrumented bare function. It dispatches on arity; has better and more informative error handling; does tail-call elimination; allows for `pre` and `post` testing of arguments and returns; etc. With one argument, it takes a function descriptor object with, minmally, `name` and `body` fields. `name` must be a string; body must be a function or a sequence of functions describing clauses of various arities. With two arguments, takes a string `name` and a function `body`.',
  pre: args([fn_descriptor], [is_str, is_fn]),
  body: [
    (descriptor) => defn_(descriptor),
    (name, body) => fn_(name, body)
  ]
});

let partial = fn({
  name: 'partial',
  doc: 'Partially applies a function. Takes a function and at least one argument to apply against the function when subsequent arguments are specified.',
  pre: args([is_fn, is_any]),
  body: Fn.partial
});

let loop = fn({
  name: 'loop', 
  doc: 'Takes a function that is in tail-recursive form and eliminates tail calls, if the recursive calls are made using `recur` instead of the function name. Also allows for looping of anonymous functions.',
  pre: args([is_fn]),
  body: Fn.loop
});

// `recur` cannot be instrumented because of its
// extraordinarily weird behavior
Fn.recur.doc = '`recur` is used within functions wrapped by `loop` to eliminate recursive tail calls. It will throw a variety of helpful errors if used in any other way, which can help identify when recursive calls are not in tail position.';

///// Other function functions
// Functions that manipulate functions

let never = Symbol('ludus/never');
let once = fn({
  name: 'once',
  doc: 'A function wrapped in `once` is run once, caches its result, and returns that result forever. It is useful for managing stateful constructs in a purely functional environment. (E.g., it is used in a crucial place in \'./seqs.js\' to make iterators "stateless.")',
  pre: args([is_fn]),
  body: (fn) => {
    let result = never;
    return Fn.fn(fn.name, (...args) => {
      if (result === never) result = fn(...args);
      return result;
    });
  }
});

// TODO: improve errors from here on down

// thread :: (value, ...fn) -> value
// `thread`s a value through a series of functions, i.e. the value is passed
// to the first function, the return value is then passed ot the second,
// then the third, etc. Each fn must have an arity of 1.
let thread = fn({
  name: 'thread',
  doc: '`thread`s a value through a series of functions, i.e. the value is passed to the first function, the return value is then passed ot the second,then the third, etc. Each fn must have an arity of 1. The passed value must not be `undefined`.',
  pre: args([is_some, is_fn]),
  body: (value, ...fns) => {
    let init = value;
    for (let fn of fns) {
      try {
        value = fn(value);
      } catch (e) {
        report(`Error threading ${init}.`);
        report(`${e.name || e || 'unknown error'} thrown while calling ${fn.name} with ${value.toString()}`);
        throw (e);
      }
    }
    return value;
  }
});

// thread_some :: (value, ...fn) -> value
// As `thread`, but short-circuits the thread on the first undefined return
// value.
let thread_some = fn({
  name: 'thread_some',
  doc: 'As `thread`, threading a value through a series of functions, but short-circuits on the first `undefined` return value, and returns `undefined`.',
  pre: args([is_some, is_fn]),
  body: (value, ...fns) => {
    let init = value;
    for (let fn of fns) {
      try {
        value = fn(value);
        if (value == null) return undefined;
      } catch (e) {
        report(`Error threading ${init}.`);
        report(`${e.name || e || 'unknown error'} thrown while calling ${fn.name} with ${value.toString()}`);
        throw e;
      }
    }
    return value;
  }
});

// TODO: improve names of piped/comped functions

let pipe = fn({
  name: 'pipe',
  doc: 'Creates a pipeline of unary functions, returning a unary function. Passes the argument to the first function, and then passes the return value of the first to the second function, and so on. The first value must not be undefined. Handles errors reasonably gracefully.',
  pre: args([is_fn]),
  body: (...fns) => fn({
    name: 'pipeline',
    pipe: fns,
    pre: args([is_some]),
    body: (value) => {
      let init = value;
      for (let fn of fns) {
        try {
          value = fn(value);
        } catch (e) {
          report(`Error in function pipeline called with ${init}.`)
          report(`${e.name || e || 'unknown error'} thrown while calling ${fn.name} with ${value.toString()}.`);
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
let pipe_some = fn({
  name: 'pipe_some',
  doc: 'Builds a function pipeline, as `pipe`, but short-circuits on the first undefined return value, and returns undefined.',
  pre: args([is_fn]),
  body: (...fns) => fn({
    name: 'pipeline/some',
    pipe: fns,
    pre: args([is_some]),
    body: (value) => {
      let init = value;
      for (let fn of fns) {
        try {
          value = fn(value);
          if (value == undefined) return undefined;
        } catch (e) {
          report(`Error in function pipeline called with ${init}.`)
          report(`${e.name || e || 'unknown error'} thrown while calling ${fn.name} with ${value.toString()}.`);
          throw e;
        }
      }
      return value;
    }
  })
});

let comp = fn({
  name: 'comp',
  doc: 'Composes functions, e.g. `comp(f, g)` is the same as `f(g(x))`. In other words, it builds a pipeline in reverse.',
  pre: args([is_fn]),
  body: (...fns) => {
    fns.reverse();
    return fn({
      name: 'composed',
      pre: args([is_some]),
      pipe: fns,
      body: pipe(...fns)
    });
  }
});

let comp_some = fn({
  name: 'comp_some',
  doc: 'Composes functions, as `comp`, but short-circuits on the first `undefined` value.',
  pre: args([is_fn]),
  body: (...fns) => {
    fns.reverse();
    return fn({
      name: 'composed/some',
      pre: args([is_some]),
      pipe: fns,
      body: pipe_some(...fns)
    })
  }
});

let call = fn({
  name: 'call',
  doc: 'Takes a function and a set of arguments--as arguments--and calls the function with those arguments.',
  pre: args([is_fn], [is_fn, is_any]),
  body: (fn, ...args) => fn(...args)
});

let apply = fn({
  name: 'apply',
  doc: 'Takes a function and a sequence of arguments and calls the fucntion with that sequence of arguments.',
  pre: args([is_fn, is_sequence]),
  body: (fn, args) => fn(...args)
});

let ap = fn({
  name: 'ap',
  doc: 'Takes a sequence with the function in the first position and its arguments after, and applies the arguments to that function.',
  pre: args([is_sequence]),
  body: ([fn, ...args]) => fn(...args)
});

let thunk = fn({
  name: 'thunk',
  doc: 'Represents a deferred computation: takes a function and a set of arguments and returns a nullary function that will apply the arguments to that function when it is called.',
  pre: args([is_fn], [is_fn, is_any]),
  body: (fn, ...args) => {
      let name = `thunk<${get('name', fn)}(${Str.from(map(Ludus.show, args), ', ')})>`;
      let body = () => fn(...args);
      return Fn.fn(name, body)
  }
});

let method_descriptor = Spec.record('method_descriptor', {
  name: is_str,
  not_found: maybe(is_fn),
  doc: maybe(is_str),
  pre: pre_post,
  post: pre_post
});

let method = fn({
  name: 'method',
  pre: args([method_descriptor]),
  body: ({name, not_found, ...attrs}) => {
    return fn({name, not_found, ...attrs,
      body: Ludus.method({name, not_found})});
  }
});

let show = fn({
  name: 'show',
  pre: args([is_fn]),
  body: (fn) => fn.name ? `[λ: ${fn.name}]` : '[λ]'
});

export default ns(Fn, {
    defn: fn, fn, partial, loop, recur: Fn.recur,
    once, thread, thread_some, pipe, pipe_some, comp, comp_some, method, show,
    call, apply, ap, thunk
});
