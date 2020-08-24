//////////////////// A REPL playground
import { types, functions, values, predicates } from './core.js';

let {n_ary, rename, loop, multi} = functions;
let {type} = types;
let {get} = values;

let explain = multi('explain', get('ludus/spec'), 
  (predicate, value) => predicate(value)
    ? null
    : `${value} : ${type(value).description} failed predicate ${predicate.name || predicate.toString()}`);

// wraps a function in a try/catch to give better error messages
let handle = (name, body) => rename(name,
  (...args) => {
    try {
      return body(...args);
    } catch (e) {
      let msg = `${e.name} thrown in ${name} called with (${args.map(x => x.toString()).join(', ')})`;
      let msgs = e.msgs || [];
      
      msgs.push(msg);
      console.error(msg);
      throw e;
    }
  });

// wraps a plain function with the Ludus bells & whistles:
// loop/recur, handle, and arity dispatch if given an array of functions
// NB: The reason the second arity takes an array rather than a variadic
//   rest args is n_ary, at current, only allows explicit arities as clauses
let fn = n_ary('fn',
  (body) => fn(body.name || 'anonymous', body),
  (name, body) => {
    switch (type(body)) {
      case types.Function:
        return rename(name,
          loop(handle(name, body)));
      case types.Array:
        return rename(name, 
          loop(handle(name, n_ary(name, ...body))));
    }
  }
);

let pre_post = (pre, post, body) => {
  let out = (...args) => {
    let pass_pre = true;
    for (let pred of pre) {
      pass_pre = pass_pre && pred(...args);
      if (!pass_pre) throw Error(`Arguments to ${body.name} did not conform to spec.\n${explain(pred, args)}`);
    }

    let result = body(...args);

    let pass_post = true;
    for (let pred of post) {
      pass_post = pass_post && pred(result);
      if (!pass_post) throw Error(`Returns from ${body.name} did not conform to spec.\n${explain(pred, result)}`);
    }

    return result;
  };

  return rename(body.name, out);
};

// questions:
// - do we really want to overload `body` in this way? (probably)
// - how to handle the multiple options of args to defn? (probably this needs to be a multimethod; alternately, be less permissive than clj)
// - alternately, don't use positional arguents?
// - do we really want a special `sign` form? (no.)


// allows for the declaration of functions with various kinds of metadata
let defn = n_ary('defn',
  (attrs) => {
    let {name, body, ...meta} = attrs;
    let fn_ = fn(name, body);

    let out = pre_post(meta.pre || [], meta.post || [], fn_);

    return Object.defineProperty(rename(name, out), 'meta', {value: meta});
  }
);

////// playing with assoc, conj, prototypes:
// immutable data types for real!

// assoc adds or modifies the value at the key
// works for objects and arrays
let assoc = (obj, key, value) => {
  // test for equality: if the object already has an equal key at that value,
  // just return the object (and it will be === to the obj)
  // TODO: make this robust, using `eq` (also TODO: write `eq`)
  if (obj[key] === value) return obj;
  if (obj.length && (key >= obj.length || key < 0)) 
    throw Error(`Cannot assoc properties to indexes that are out of bounds.`)
  return Object.assign(Object.create(obj), {[key]: value})
};

let keys = (obj) => {
  let keys = [];
  for (let key in obj) {
    keys.push(key);
  }
  return keys;
};

let show = (obj) => {
  switch(obj.constructor) {
    case Array:
      return `[${obj.join(', ')}]`;
    case Object:
      return `{${keys(obj).sort().map(k => `${k}: ${obj[k]}`).join(', ')}}`;
    case String:
      return `'${obj}'`;
  }
};

let conj = (coll, value) => {
  switch(coll.constructor) {
    case Array: {
      let length = coll.length;
      let out = Object.create(coll);
      out[length] = value;
      Object.defineProperty(out, 'length', {value: length + 1});
      return out;
    }
    case String:
      return coll + value;
    case Object: {
      if (value.constructor === Object) {
        return Object.assign(Object.create(coll), value);
      }
      if (value.constructor === Array) {
        let [k, v] = value;
        return assoc(coll, k, v);
      }
    }
  }
};

show(conj(conj(conj([], 1), 2), 3)); //=
show(conj({a: 1, b: 2}, {c: 3, d: 4})); //=