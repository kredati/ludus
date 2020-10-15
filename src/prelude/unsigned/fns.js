/////////////////// Functions
// Basic function manipulations. Many obvious things aren't here because
// they are easily expressible in Ludus and aren't necessary for Prelude.

import Ludus from './base.js';
import Err from './errors.js';
import Spec from './spec.js';
import Pred from './preds.js';
import {copy_attrs} from './util.js';

let {raise, handle} = Err;

// rename :: (fn) -> fn
// `rename`s a function
// JS functions cannot be renamed using ordinary property access, since
// `name` is not a configurable property. We have to use Object.defineProperty
// instead, which is what `copy_attrs` does.
let rename = (name, fn) => copy_attrs(fn, {name});

// partial :: (fn, ...any) -> fn
// Partially applies a function. Returns a function that can takes the
// remaining args. Partially applied functions must called with at least
// one argument.
let partial = (fn, ...args) => {
  let partial_name = 
    `${fn.name}<partial (${args.map(Ludus.show).join(', ')})>`;
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
      : raise(ArgumentError, `Wrong number of arguments to ${name}. It takes ${Object.keys(arity_map).join(' or ')} argument(s), but received ${args.length}: (${args.map(Ludus.show).join(', ')}).`) 
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
    throw new SyntaxError('recur must only be used in the tail position inside of loop.');
  },
  apply () { // will throw if something `recurred` is called as a function
    throw new SyntaxError('recur must only be used in the tail position inside of loop.');
  }
};

let recur = (...args) => new Proxy(Object.assign(() => {}, 
  // note that technically recur returns a proxy around a function;
  // this lets us use the `apply` proxy handler to throw when
  // the call to recur is used as a function.
  {
    [recur_tag]: true, [recur_args]: args,
    [Symbol.toPrimitive] () { // will throw on coercion to an atomic value
      throw new SyntaxError('recur must only be used in the tail position inside of loop.');
    },
    [Symbol.toString] () { // will throw on coercion to a string
      throw new SyntaxError('recur must only be used in the tail position inside of loop.');
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
      throw new Error(`Too much recursion in ${name}.`)
    
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
  if (!Pred.is_array(pre)) pre = [pre];
  if (!Pred.is_array(post)) post = [post];
  let pass_pre = true;
  for (let spec of pre) {
    let result = Spec.is_valid(spec, args);
    let pass = result !== false && result != undefined;
    pass_pre = pass_pre && pass;
    if (!pass_pre) throw new ArgumentError(`Arguments to ${body.name} did not conform to spec.\n${Spec.explain(spec, args)}`);
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

//////////////////// Defn
// finally

// defn :: (object) -> fn
// `defn` fully instruments a function with everything Ludus has to offer.
// To `fn`, it adds `pre_post`, as well as arbitrary metadata (including
// `doc` and `eg`.)
// to work, it requires:
// - name :: string
// - body :: fn | [fn]
// - pre :: fn | [fn]?
// - post :: fn | [fn]?
// Other attribute restrictions are not required for `defn` to work, but
// will be applied later (e.g., `doc` must be a string). Metadata is not
// held directly on the function but on a non-enumerable `attrs` property.
// `attrs` also includes a `clauses` field that contains an array of the
// function literals passed to `defn`.
let defn = ({name, body, pre = [], post = [], ...attrs}) => {
  let clauses = Pred.is_fn(body) ? [body] : body;
  let out = pre_post(pre, post, fn(name, clauses));
  return copy_attrs(out, {name, clauses, ...attrs});
};

export {rename, partial, 
  n_ary, loop, recur, fn, pre_post, 
  ArgumentError,
  defn 
};

export default Ludus.NS.defmembers(Ludus.Fn,
  {rename, partial, n_ary, loop, recur, fn, pre_post, defn});
