//////////////////// Objects
// Functions for working with objects
// TODO: decide if I want all objs to become hamts

import L from './deps.js';
import Fn from './fns.js';
import NS from './ns.js';
import Spec from './spec.js';
import Pred from './preds.js';
import Arr from './arr.js';

let {fn, partial} = Fn;
let {is_any, is_key, is_obj, is_fn, is_js_obj, is_some} = Pred;
let {args, dict, tup, iter_of} = Spec;
let {ns} = NS;

let get = fn({
  name: 'get',
  doc: `Gets the value stored at a particular key in an object. Returns \`undefined\` if value is not found. It returns \`undefined\` when looking for a property on anything that cannot have properties: e.g., \`undefined\`, booleans, and numbers. Given an indexed value (arrays, but also strings) it returns the value at the corresponding index. Returns only own properties. To get properties in the prototype chain, or at symbol keys, use \`get_\`.`,
  pre: args([is_key], [is_key, is_any], [is_key, is_any, is_some]),
  body: [
    (key) => partial(get, key),
    (key, obj) => {
      if (obj == undefined) return undefined;
      if (Arr.is_immutable(obj)) return obj[key];
      return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    },
    (key, obj, not_found) => {
      let value = get(key, obj);
      return value == undefined
        ? not_found
        : value
    }
  ]
});

let get_ = fn({
  name: 'get_',
  doc: 'Gets the value stored at a particular key in an object, traversing the JS prototype chain, and also allowing symbols to serve as keys. Returns `undefined` if an object is missing a key, or cannot store keys.',
  body: [
    (key) => partial(get_js, key),
    (key, obj) => {
      if (obj == undefined) return undefined;
      return obj[key];
    }
  ]
});

let get_in = fn({
  name: 'get_in',
  doc: 'Nested property access. Given a collection, take a path to a particular value represented by a sequence of keys. Returns `undefined` if there is nothing at that path. E.g. `get_in({a: [1, 2, 3]}, [\'a\', 1]); //=> 2`.',
  // TODO: partial application with one argument?
  // TODO: enforce a requirement that the path be non-empty?
  pre: args([is_any, iter_of(is_key)], [is_any, iter_of(is_key), is_some]),
  body: [
  (obj, path) => {
  if (obj == undefined) return undefined;
  let result = obj;
  for (let key of path) {
    result = get(key, result);
    if (result == undefined) return undefined;
  }
  return result;
  },
  (obj, path, not_found) => {
    let result = get_in(obj, path);
    return result == undefined ? not_found : result;
  }
  ]
});

// TODO: get object update functions to work nicely on sequences
// Honestly, these feel like they might want to be methods
let _assoc = fn({
  name: 'assoc',
  doc: 'Returns a new object with the value at that key.',
  pre: args([is_obj, is_key, is_any]),
  body: (obj, key, value) => ({...obj, [key]: value})
});

let _assoc_ = fn({
  name: 'assoc_',
  doc: 'Mutates an object, associating the value with the key.',
  pre: args([is_js_obj, is_key, is_any]),
  body: (obj, key, value) => {
    obj[key] = value;
    return obj;
  }
});

let dissoc = fn({
  name: 'dissoc',
  doc: 'Returns a new object with the specified key removed. The opposite of `assoc`. E.g., `dissoc({a: 1, b: 2}, \'b\'); //=> {a: 1}',
  pre: args([is_obj, is_key]),
  body: (obj, key) => {
    let out = {};
    for (let k in obj) {
      if (k === key) continue;
      out[k] = obj[k];
    }
    return out;
  }
});

let dissoc_ = fn({
  name: 'dissoc_',
  doc: 'Deletes a key on an object, mutating the object.',
  pre: args([is_js_obj, is_key]),
  body: (obj, key) => {
    delete obj[key];
    return obj
  }
});

let update = fn({
  name: 'update',
  doc: 'Updates a value in an object. Takes, at minimum, an object, a key, and a function, and returns a new object with the value at the key updated to be the result of passing it to the function. If the key does not exist, passes `undefined` as the old value. Any additional arguments to the function can be supplied. E.g., `update({a: 1}, \'a\', inc); //=> {a: 2}`.',
  pre: args([is_obj, is_key, is_fn],
    [is_obj, is_key, is_fn, is_any]),
  body: (obj, key, fn, ...args) => ({...obj, [key]: fn(obj[key], ...args)})
});

// TODO: actually write this function
/*
let update_in = defn({
  name: 'update_in',
  doc: 'Updates a nested property. Given a collection and a path to a nested property, update the value at that path using a function. Uses `undefined` as the value if there is nothing at the path. Allows for extra arguments to be passed.',
  pre: args([is_assoc, is_sequence_of(is_key), is_fn],
    [is_assoc, is_sequence_of(is_key), is_fn, is_any]),
  body: (obj, path, fn, ...args) => {
    // do something here
  }
});
*/

let update_with = fn({
  name: 'update_with',
  doc: 'Updates multiple properties at once. Given a collection and a dictionary of functions, returns a new object with updated values that are the result of applying the matching function to the value in the collection. Passes `undefined` as the argument if the value is not found. The dictionary of update functions must be flat, and the functions must be unary. E.g., `update_with({foo: 42}, {foo: inc}); //=> {foo: 43}`.',
  pre: args([is_obj, dict(is_fn)]),
  body: (obj, updates) => {
    let updated = {};
    for (let key of keys(updates)) {
      updated[key] = updates[key](obj[key])
    }
    return {...obj, ...updated};
  }
});

let kv = tup(is_key, is_any);

let concat = fn({
  name: 'concat',
  doc: 'Creates a new object, combining the object as the first argument with a sequence of key-value tuples. If the key-value pairs duplicate a key, silently overwrites the value; later pairs take precedence. E.g., `concat({a: 1}, [[\'b\', 2], [\'c\', 3]]; //=> {a: 1, b: 2, c: 3}`.',
  pre: args([is_obj, iter_of(kv)]),
  body: (obj, kvs) => Object.assign(obj, Object.fromEntries(kvs))
});

let merge = fn({
  name: 'merge',
  doc: 'Creates a new object, combining the objects passed in. If objects duplicate a key, silently overwrites the value; later objects take precedence.E.g. `assign({a: 1, b: 2}, {b: 3, c: 4}); //=> {a: 1, b: 3, c: 4}`.',
  pre: args([is_obj]),
  body: (...objs) => Object.assign({}, ...objs)
});

let keys = fn({
  name: 'keys',
  doc: 'Returns an array of an object\'s keys. Returns an empty array if the object has no properties.',
  body: (obj) => obj == undefined ? [] : Object.keys(obj)
});

let values = fn({
  name: 'values',
  doc: 'Returns an array of the values stored in an object. Returns an empty array if the object has no properties.',
  body: (obj) => obj == undefined ? [] : Object.values(obj)
});

let entries = fn({
  name: 'entries',
  doc: 'Returns an array of `[key, value]` pairs for each property on an object. Returns an empty array if the object has no properties. E.g., `entries({a: 1, b: 2}); //=> [ [ \'a\', 1 ], [ \'b\', 2 ] ]`.',
  body: (obj) => obj == undefined ? [] : Object.entries(obj)
});

let empty = fn({
  name: 'empty',
  doc: 'Returns an empty object',
  body: () => ({})
});

let conj = fn({
  name: 'conj',
  doc: '`conj`oins a `[key, value]` tuple to an object.',
  pre: args([is_obj, tup(is_key, is_any)]),
  body: (obj, [key, value]) => _assoc(obj, key, value)
});

let conj_ = fn({
  name: 'conj_',
  doc: '`conj`oins a `[key, value]` tuple to an object, mutating the object.',
  pre: args([is_obj, tup(is_key, is_any)]),
  body: (obj, [key, value]) => _assoc_(obj, key, value)
});

let from = fn({
  name: 'from',
  doc: 'Creates an object from an iterable containing `[key, value]` tuples.',
  pre: args([iter_of(kv)]),
  body: (entries) => Object.fromEntries(entries)
});

let show = fn({
  name: 'show',
  doc: 'Shows an object by naïvely dumping everything into a string.',
  pre: args([is_obj]),
  body: (obj) => `{${entries(obj)
    .map(([k, v]) => k + ': ' + L.show(v))
    .join(', ')}}`
});

export default ns(L.Obj, {
  get, get_, get_in, 
  concat, update, update_with,
  merge, keys, values, entries,
  empty, conj, conj_, from,
  assoc: _assoc, assoc_: _assoc_, 
  dissoc, dissoc_, show
});
