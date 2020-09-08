//////////////////// Objects

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';
import E from './eq.js';

let {defn, partial} = F;
let {sign, splat} = L;
let {is_any, is_key, is_assoc, is_fn, has, or, is_symbol, is_sequence_of, dict} = P;
let {eq} = E;

let is_js_key = or(is_key, is_symbol);

let get = defn({
  name: 'get',
  doc: `Gets the value stored at a particular key in an object. Returns \`undefined\` if value is not found. It returns \`undefined\` when looking for a property on anything that cannot have properties: e.g., \`undefined\`, booleans, and numbers. Given an indexed value (arrays, but also strings) it returns the value at the corresponding index. Returns only own properties. To get properties in the prototype chain, or at symbol keys, use \`get_js\`.`,
  pre: sign([is_key], [is_key, is_any]),
  body: [
    (key) => partial(get, key),
    (key, obj) => {
      if (obj == undefined) return undefined;
      return obj.hasOwnProperty(key) ? obj[key] : undefined;
    }
  ]
});

let get_js = defn({
  name: 'get_js',
  doc: 'Gets the value stored at a particular key in an object, traversing the prototype chain, and also allowing symbols to serve as keys. Returns `undefined` if an object is missing a key, or cannot store keys.',
  pre: sign([is_js_key], [is_js_key, is_any]),
  body: [
    (key) => partial(get_js, key),
    (key, obj) => {
      if (obj == undefined) return undefined;
      return obj[key];
    }
  ]
});

let get_in = defn({
  name: 'get_in',
  doc: 'Nested property access. Given a collection, take a path to a particular value represented by a sequence of keys. Returns `undefined` if there is nothing at that path. E.g. `get_in({a: [1, 2, 3]}, [\'a\', 1]); //=> 2`.',
  pre: sign([is_assoc, is_sequence_of(is_key)]),
  body: (obj, path) => {
    let result = obj;
    for (let key of path) {
      result = get(key, result);
      if (result == undefined) return undefined;
    }
    return result;
  } 
});

// TODO: get object update functions to work nicely on sequences
// Honestly, these feel like they might want to be multimethods
let assoc = defn({
  name: 'assoc',
  doc: 'Returns a new object with the value at that key.',
  pre: sign([is_assoc, is_key, is_any]),
  body: (obj, key, value) => ({...obj, [key]: value})
});

let update = defn({
  name: 'update',
  doc: 'Updates a value in an object. Takes, at minimum, an object, a key, and a function, and returns a new object with the value at the key updated to be the result of passing it to the function. If the key does not exist, passes `undefined` as the old value. Any additional arguments to the function can be supplied. E.g., `update({a: 1}, \'a\', inc); //=> {a: 2}`.',
  pre: sign([is_assoc, is_key, is_fn],
    [is_assoc, is_key, is_fn, is_any]),
  body: (obj, key, fn, ...args) => ({...obj, [key]: fn(obj[key], ...args)})
});

// TODO: actually write this function
let update_in = defn({
  name: 'update_in',
  doc: 'Updates a nested property. Given a collection and a path to a nested property, update the value at that path using a function. Uses `undefined` as the value if there is nothing at the path. Allows for extra arguments to be passed.',
  pre: sign([is_assoc, is_sequence_of(is_key), is_fn],
    [is_assoc, is_sequence_of(is_key), is_fn, is_any]),
  body: (obj, path, fn, ...args) => {
    // do something here
  }
});

let update_with = defn({
  name: 'update_with',
  doc: 'Updates multiple properties at once. Given a collection and a dictionary of functions, returns a new object with updated values that are the result of applying the matching function to the value in the collection. Passes `undefined` as the argument if the value is not found. The dictionary of update functions must be flat, and the functions must be unary. E.g., `update_with({foo: 42}, {foo: inc}); //=> {foo: 43}`.',
  pre: sign([is_assoc, dict(is_fn)]),
  body: (obj, updates) => {
    let updated = {};
    for (let key of keys(updates)) {
      updated[key] = updates[key](obj[key])
    }
    return {...obj, ...updated};
  }
});

let assign = defn({
  name: 'assign',
  doc: 'Creates a new object, combining the objects passed in. If objects duplicate a key, silently overwrites the value; later objects take precedence.E.g. `assign({a: 1, b: 2}, {b: 3, c: 4}); //=> {a: 1, b: 3, c: 4}`.',
  pre: splat(is_assoc),
  body: (...objs) => Object.assign({}, ...objs)
});

let merge = defn({
  name: 'merge',
  doc: 'Creates a new object, combining the objects passed in. If objects duplicate a key and the values at that key are different (according to `eq`), it throws an error. E.g., `merge({a: 1, b: 2}, {c: 3}); //=> {a: 1, b: 2, c: 3}`.',
  pre: splat(is_assoc),
  body: (...objs) => {
    let out = {};
    for (let obj of objs) {
      for (let key in obj) {
        if (has(key, out) && !eq(obj[key], out[key]))
          throw Error(`Cannot merge: multiple objects have key ${key} in them.`);
        out[key] = obj[key];
      }
    }
    return out;
  }
});

let keys = defn({
  name: 'keys',
  doc: 'Returns an array of an object\'s keys. Returns an empty array if the object has no properties.',
  body: (obj) => obj == undefined ? obj : Object.keys(obj)
});

let values = defn({
  name: 'values',
  doc: 'Returns an array of the values stored in an object. Returns an empty array if the object has no properties.',
  body: (obj) => obj == undefined ? obj : Object.values(obj)
});

let entries = defn({
  name: 'entries',
  doc: 'Returns an array of `[key, value]` pairs for each property on an object. Returns an empty array if the object has no properties. E.g., `entries({a: 1, b: 2}); //=> [ [ \'a\', 1 ], [ \'b\', 2 ] ]`.',
  body: (obj) => obj == undefined ? obj : Object.entries(obj)
});

let Obj = L.ns({
  name: 'Obj',
  space: {
    get, get_js, get_in, 
    assoc, update, update_with,
    assign, merge, keys, values, entries
  }
});

export default Obj;