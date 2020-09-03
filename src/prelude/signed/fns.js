//////////////////// Functions (signed)
// Functions on functions that aren't involved in signing.

///// other useful functional manipulations

// once :: (fn) -> fn
// A function wrapped in `once` is run once, caches its result, and returns
// that result forever. It's useful for managing stateful constructs in a
// purely functional environment. (E.g., it is used in a crucial place
// in './seqs.js' to make iterators "stateless.")
let never = Symbol('ludus/never');
let once = (fn) => {
  let result = never;
  return rename(fn.name, (...args) => {
    if (result === never) result = fn(...args);
    return result;
  });
};

// thread :: (value, ...fn) -> value
// `thread`s a value through a series of functions, i.e. the value is passed
// to the first function, the return value is then passed ot the second,
// then the third, etc. Each fn must have an arity of 1.
let thread = (value, ...fns) => {
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
};

// thread_some :: (value, ...fn) -> value
// As `thread`, but short-circuits the thread on the first undefined return
// value.
let thread_some = (value, ...fns) => {
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
};

// pipe :: (...fn) -> (value -> value)
// Creates a pipeline of unary functions, returning a unary function.
// Passes the argument to the first function, and then passes the return
// value of the first to the second function, and so on.
// Handles errors semi-gracefully.
let pipe = (...fns) => rename('pipeline', (value) => {
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
});

// pipe_some :: (...fn) -> (value -> value)
// Builds a function pipeline, as `pipe`, that short circuits on the first
// undefined return value.
let pipe_some = (...fns) => rename('pipeline/some', (value) => {
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
});