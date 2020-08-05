//////////////////// A REPL playground
import core, { types, functions, transducers, values } from './core.js';

let {n_ary, rename, loop, multi, pipe} = functions;
let {type} = types;
let {get, boolean} = values;
let {every, transduce, map} = transducers;

let explain = multi('explain', get('ludus/spec'), 
  (predicate, value) => 
    `${value} : ${type(value)} failed predicate ${predicate}`);

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
    : raise(Error, explain(pred, value))
);

let pre_post = (pre, post, body) => {
  let out = (...args) => {
    let pass_pre = transduce(map(pipe(apply_to(args), boolean)), (x, y) => x && y, true, pre);
  };

  return out;
};

let quux = x => x === 'foo' ? 'foo' : null;
let quuz = x => x.length === 3 ? 3 : null;
let and = (x, y) => x && y;
let id = x => x;

let bar = transduce(map(pipe(apply_to(['bar']), boolean)), and, true, [quux, quuz])
bar

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