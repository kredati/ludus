/////////////////// Functions
// Basic function manipulations. Many obvious things aren't here because
// they are easily expressible in Ludus and aren't necessary for Prelude.

import Ludus from './env.js';
import {raise, handle, report} from './errors.js';
import {HashMap, HashError} from './hash.js';

// rename :: (fn) -> fn
// `rename`s a function
// JS functions cannot be renamed using ordinary property access, since
// `name` is not a configurable property. We have to use Object.defineProperty
// instead.
let rename = (name, fn) => Object.defineProperty(fn, 'name', {value: name});

// partial :: (fn, ...any) -> fn
// Partially applies a function. Returns a function that can takes the
// remaining args. Partially applied functions must called with at least
// one argument.
let partial = (fn, ...args) => {
  let partial_name = 
    `${fn.name}<partial (${args.map(Ludus.inspect).join(', ')})>`;
  return rename(partial_name, 
    (...args2) => args2.length > 0
      ? fn(...args, ...args2) 
      : raise(Error, `Not enough arguments to \`${partial_name}\`: Partially applied functions must be called with at least 1 argument; you passed 0.`));
  };

///// Function dispatch

// ArgumentError
// An error for telling users: the arguments just aren't right
class ArgumentError extends Error {};

// n_ary :: (name, ...fn) -> fn
// `n_ary` creates a function that dispatches on the number of arguments.
// Throws if the number of arguments does not match an arity. However,
// any arguments beyond the largest available arity are passed to that
// function. This allows for rest args.
// NB: Rest args do not count as an argument for determining the arity
// of a function (because you could pass 0 args in the rest position and 
// that would be fine).
// Consider the following:
/*
  let add = n_ary(
    (x, y) => x + y,
    (x, y, z, ...rest) => reduce(rest, add, x + y + z)
  );
*/
// We need the `z` to distinguish the two clauses, because `(x, y, ...rest)` 
// has an arity of 2.
let n_ary = (name, ...clauses) => {
  clauses
  let arity_map = clauses.reduce(
    (map, fn) => !(fn.length in map)
      ? Object.assign(map, {[fn.length]: fn})
      : raise(Error, `Functions may only have one clause of a given arity. You gave ${name} two clauses of arity ${fn.length}.`), 
    {});
  let max_arity = Math.max(...Object.keys(arity_map));

  let match_arity = (...args) => {
    let arity = Math.min(args.length, max_arity);
    let match = arity_map[arity];

    return match 
      ? match(...args) 
      : raise(ArgumentError, `Wrong number of arguments to ${name}. It takes ${Object.keys(arity_map).join(' or ')} argument(s), but received ${args.length}: (${args.map(Ludus.inspect).join(', ')}).`) 
  };

  return rename(name, match_arity);
};

///// loop & recur
// Ludus is trying very hard to be Lispish. That means avoiding
// imperative looping constructs, and optimizing recursion as a functional
// looping strategy, and thus tail-call optimization.
// `loop` & `recur` allow for tail-call-optimized single-recursion.
// They do not allow for mutual recursion. (But trampolines exist.)

// `recur` has no specific signature, although technically it's
// recur :: (...value) -> fn
// It is a proxy for a tail-recursive call inside a `loop`ed function.
// It returns a special object that encapsulates arguments, and also
// throws errors when anything else is accessed, or if it's coerced to an
// atomic value. This allows for errors to be thrown when `recur` is 
// used anywhere but in tail position in a function wrapped by `loop` without
// having to do any compiling or parsing.
// TODO: investigate if this is fast enough?--the proxy slows things down
//   and `recur` is going to be used in tight loops
let recur_tag = Symbol('ludus/recur'); // not exported
let recur_args = Symbol('ludus/recur/args'); // not exported
let recur_handler = { // not exported
  get (target, prop) { // will throw if anything but symbol tags are accessed
    if (prop === recur_tag || prop === recur_args) return target[prop];
    throw SyntaxError('recur must only be used in the tail position inside of loop.');
  },
  apply () { // will throw if something `recurred` is called as a function
    throw SyntaxError('recur must only be used in the tail position inside of loop.');
  }
};

let recur = (...args) => new Proxy(Object.assign(() => {}, 
  // note that technically recur returns a proxy around a function;
  // this lets us use the `apply` proxy handler to throw when
  // the call to recur is used as a function.
  {
    [recur_tag]: true, [recur_args]: args,
    [Symbol.toPrimitive] () { // will throw on coercion to an atomic value
      throw SyntaxError('recur must only be used in the tail position inside of loop.');
    },
    [Symbol.toString] () { // will throw on coercion to a string
      throw SyntaxError('recur must only be used in the tail position inside of loop.');
  }
}), recur_handler);

// loop :: (fn, number?) -> fn
// `loop` wraps a function with a handler so that `recur` can be used as a proxy
// for a recursive call. The optional second argument is the max number of 
// loops before an error is thrown, to prevent infinite recursion. Its
// default value: 1,000,000. (Unlike normally recursive functions, which will
// blow the stack and deliver a "too much recursion" error, infinite recursion
// with 'loop'/'recur' will simply hang the program.
let loop = (fn, max_iter = 1000000) => {
  let name = fn.name || 'anon. loop';
  let looped = (...args) => {
    let result = fn(...args);
    let iter = 0;

    while (result != undefined && result[recur_tag] && iter < max_iter) {
      result = fn(...result[recur_args]);
      iter += 1;
    }

    if (iter >= max_iter) 
      throw Error(`Too much recursion in ${name}.`)
    
    return result;
  };

  return Object.defineProperties(looped, {
    name: {value: `${name}`},
    length: {value: fn.length}
  })
};

///// function definition
// fn wraps a function in bare ludus bells & whistles:
// handle, n_ary, and loop
// TODO: consider skipping "handle" in production
// TODO: consider making the user explicitly add `loop`/`recur` handling 
//   (i.e, `defrec`)
// TODO: consider changing the order of `loop`/`handle`/`n_ary` for better
//   performance?

// fn :: (fn) -> fn
// fn :: ([fn]) -> fn
// fn :: (string, fn) -> fn
// fn :: (string, [fn]) -> fn
// `fn` wraps function literals with the base set of function decorators:
// - better error handling (`handle`, in './errors.js')
// - `loop`/`recur` functionality (i.e. no need to wrap `fn`s with `loop`)
// - `n_ary` for arity-based function dispatch as well as checking for the
//    correct number of arguments
// `fn` is mostly used in `defn`, but also may well be useful for anonymous
// functions that still need instrumentation.
// TODO: Conditional instrumentation based on environment, to optimize
//        for speed, e.g. "production" vs. "repl".
let fn = n_ary('fn',
  (body) => fn(body.name || 'anon. fn', body),
  (name, body) => {
    switch (typeof body) {
      case 'function':
        return rename(name,
          loop(handle(name, n_ary(name, body))));
      case 'object':
        return body[Symbol.iterator]
          ? rename(name, loop(handle(name, n_ary(name, ...body))))
          : raise(TypeError, `Body clauses must be contained in an iterable.`)
    }
  }
);

// pre_post :: ([fn], [fn], fn) -> fn
// `pre_post` wraps a function with predicates that evaluate
// the arguments and return values. The first two arguments (`pre` and
// `post`) must be arrays of functions. All of them are run against the
// arguments/returns. Each `pre` function receives all the arguments.
// The evaluation of predicates is Ludus-truthy and -falsy.
// Pre and post short circuits on the first error (this is easier).
// It dispatches error message to `explain`, defined in './predicates.js'.
// TODO: reconsider short-circuiting: accumulate all failures?
// TODO: conditional instrumentation based on environment, as `fn`, above
let pre_post = (pre, post, body) => rename(body.name, (...args) => {
    let pass_pre = true;
    for (let pred of pre) {
      let result = pred(...args);
      let pass = result !== false && result != undefined;
      pass_pre = pass_pre && pass;
      if (!pass_pre) throw ArgumentError(`Arguments to ${body.name} did not conform to spec.\n${explain(pred, args)}`);
    }

    let result = body(...args);

    let pass_post = true;
    for (let pred of post) {
      let result = pred(result);
      let pass = result !== false && result != undefined;
      pass_post = pass_post && pass;
      if (!pass_post) throw Error(`Returns from ${body.name} did not conform to spec.\n${explain(pred, result)}`);
    }

    return result;
  });


//////////////////// Multimethods
// Multimethods are how Ludus deals with dispatch more complex than
// arity. They allow for arbitrary function dispatch, including 
// multiple dispatch.

// MethodError
// Give ourselves a special error so we can avoid swallowing any
// errors that arise in multimethods. It's a thin wrapper over the
// Error class.
class MethodError extends Error {}

// A default default method for multimethods
// It just raises a MethodError: no method found.
// Not exported.
let method_not_found = (name) => (value, ...args) =>
  raise(MethodError, 
    `No method found in multimethod ${name} with arguments (${args.map(a => a.toString()).join(', ')}) and a dispatch value of ${value.toString()}.`)

// A tag for multimethods.
// Not exported.
let multi_tag = Symbol('ludus/multimethod');

// multi :: (string, fn, fn) -> multimethod
// Make a multimethod.
// A multimethod dispatches on the value returned from the function `on`.
// The optional third argument is the fallback function, if no method
// is found for the return value from `on`.
// If no fallback function is supplied, the default behavior is to raise 
// an error, by dispatching to `method_not_found`.
let multi = (name, on, not_found = method_not_found(name)) => {
  let map = new HashMap();

  let dispatch = (...args) => {
    let value = on(...args);
    let fn = map.get(value);
    return fn != undefined
      ? fn(...args)
      : not_found(value, ...args);
  };

  // some internal methods for a multimethod
  // add a new method
  let set = (value, fn) => { map.set(value, fn); };
  // ask if there's a method already described for a value
  let has = (value) => map.has(value);
  // get a particular method
  let get = (value) => map.get(value);
  // list the methods we already have
  // note that the entry keys from a HashedMap are BigInt junk,
  // so pull out the actual entries
  let methods = () => {
    let entries = [];
    for (let [_, [entry]] of map.entries()) {
      entries.push(entry);
    }
    return entries;
  };

  return rename(name, 
    Object.defineProperty(dispatch, multi_tag, 
      {value: {set, has, methods, get, on}}));
};

// method :: (multimethod, value, fn) -> multimethod
// `method` adds a method (function) to a multimethod for a particular value.
// A multimethod may only contain a single method per key, based on `eq`
// semantics. If users try to add a repeat method, it throws an error.
let method = (multimethod, value, fn) => {
  try {
    multimethod[multi_tag].set(value, fn);
  } catch (e) {
    if (e instanceof HashError)
      throw MethodError(`Multimethods may only contain a single method per value. Method ${multimethod.name} already has a method for ${value}.`);
    throw e;
  }
  return multimethod;
};

// lists the methods of a multimethod
let methods = (multimethod) => multimethod[multi_tag].methods();

// tells if a multimethod has a method defined for a particular value
let has_method = (multimethod, value) => multimethod[multi_tag].has(value);

// retrieves the function for a particular value, returning undefined if no method exists
let get_method = (multimethod, value) => multimethod[multi_tag].get(value);

// retrieves the dispatching function for a multimethod
let dispatch_on = (multimethod) => multimethod[multi_tag].on;

// explain :: (fn, [some], string?) -> string
// a quick and dirty early-on multimethod to explain the failures in
// pre/post conditions for functions.
let explain = multi('explain', x => x.explain,
  (pred, value, message = '') => `Spec failure: ${message}
  ${Ludus.inspect(value)} did not pass predicate ${Ludus.inspect(pred)}.`);

//////////////////// Defs: the three big functions!
// defn, defmulti, defmethod

// defn :: (object) -> fn
// `defn` fully instruments a function with everything Ludus has to offer.
// To `fn`, it adds `pre_post`, as well as arbitrary metadata (including
// `doc` and `eg`.)
// to work, it requires:
// - name :: string
// - body :: fn | [fn]
// - pre :: [fn]?
// - post :: [fn]?
// Other attribute restrictions are not required for `defn` to work, but
// will be applied later (e.g., `doc` must be a string). Metadata is not
// held directly on the function but on a non-enumerable `attrs` property.
// `attrs` also includes a `clauses` field that contains an array of the
// function literals passed to `defn`.
let defn = ({name, body, pre = [], post = [], ...attrs}) => {
  let clauses = typeof body === 'function' ? [body] : body;
  let out = pre_post(pre, post, fn(name, clauses));

  return Object.defineProperty(
    rename(name, out), 
    'attrs', 
    {value: {clauses, ...attrs}});
};

// defmulti :: ({name: string, on: fn, pre: [fn]?, post: [fn]?, not_found: fn?}) -> fn(multi)
// Defines a multimethod. Multimethods are ways of doing runtime dispatch.
// They are Ludus's idiomatic way of runtime dispatch. (Very Lisp!)
// They dispatch based on the result of `on`, which gets all the arguments to
// the multimethod, allowing for multiple dispatch. The return value from `on`
// is the basis for method lookup, using `eq` (not JS ===).
// Optionally, you may specify a fallback function if no method is found.
// The default behavior is in `method_not_found` (not exported), which simply
// throws a MethodError.
// Like regular functions, you can assign `pre` and `post` conditions. You can
// also assign per-method `pre` and `post` conditions.
// Any fields not listed above will be stashed in the (non-enumerable) `attrs`
// field on the multimethod, as with regular functions (e.g., `doc`).
let defmulti = ({
  name, 
  on, 
  pre = [], 
  post = [], 
  not_found,
  ...attrs}) => {
    let the_multi = multi(name, on, not_found);
    let instrumented = pre_post(pre, post, the_multi);

    return Object.defineProperties(instrumented, {
      name: {value: name},
      [globalThis[Symbol.for('ludus/inspect/custom')]]: 
        {value: () => `[fn(multi): ${name}]`},
      [multi_tag]: {value: the_multi[multi_tag]},
      attrs: {value: attrs}
    });
};

// defmethod :: ({multi: fn(multi), on: value, body: fn, pre: [fn]?, post: [fn]?}) -> fn(multi)
// Adds a method to a multimethod. Takes a multimethod, a value to match, 
// a function, pre and post conditions, and any optional attributes.
// As explained above, multimethods use `eq` as the algorithm for matching.
let defmethod = ({
  multi,
  on,
  body,
  pre = [],
  post = [],
  ...attrs
  }) => {
    let the_method = pre_post(pre, post, fn(multi.name, body));
    multi[multi_tag].set(on, the_method);
    Object.defineProperties(the_method, 
      {attrs: {value: {...attrs, on}}})
    return multi;
  };

export {rename, partial, 
  n_ary, loop, recur, fn, pre_post, 
  multi, method, methods, has_method, get_method, dispatch_on,
  ArgumentError, MethodError, explain,
  defn, defmulti, defmethod
};
