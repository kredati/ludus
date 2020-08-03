//////////////////// A REPL playground
import core, { types, functions } from './core.js';

let {n_ary, rename, loop} = functions;
let {type} = types;

// wraps a function in a try/catch to give better error messages
let handle = (name, body) => rename(name,
  (...args) => {
    try {
      return body(...args);
    } catch (e) {
      let msg = `${e.name} thrown in ${name} called with (${args.join(', ')})`,
        msgs = e.msgs || [];
      
      msgs.push(msg);
      console.error(msg);
      throw e;
    }
  });

// wraps a plain function with the Ludus bells & whistles:
// loop/recur, handle, and arity dispatch if given an array of functions
let fn = n_ary('fn',
  (body) => fn(body.name || 'anonymous', body),
  (name, body) => {
    console.log(name)
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

let call_with = (...args) => (fn) => fn(...args);

let apply_to = (args) => (fn) => fn(...args);

let assert = n_ary('assert', 
  (pred) => partial(assert, pred),
  (pred, value) => pred(value) 
    ? value 
    : raise(Error, `${value} did not pass assertion ${pred.name}`)
);

let pre_post = (pre, post, body) => {
  let out = (...args) => {
    let 
  };

  return out;
};

// allows for the declaration of functions with various kinds of metadata
let defn = n_ary('defn',
  (attrs) => {
    let {name, body, ...meta} = attrs,
      fn_ = fn(name, body);

    let out = (...args) => {

    };

    return Object.assign(fn(name, body), meta);
  },
);

let foo = defn({
  name: 'foo',
  doc: 'returns foo',
  meta: {bar: 'baz'},
  pre: [],
  post: [],
  sign: [],
  body: () => 'foo'
});

foo 