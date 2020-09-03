//////////////////// Multimethods
// Multimethods are how Ludus deals with dispatch more complex than
// arity. They allow for arbitrary function dispatch, including 
// multiple dispatch. 

// TODO: design metadata and pre/post scheme for multimethods

import Ludus from './env.js';
import {HashMap, HashError} from './hash.js';
import {raise} from './errors.js';
import {rename, pre_post, fn} from './functions.js';

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

let get_method = (multimethod, value) => multimethod[multi_tag].get(value);

let dispatch_on = (multimethod) => multimethod[multi_tag].on;

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

export {method, multi, methods, has_method, get_method, dispatch_on, defmulti, defmethod, MethodError};
