// our library dependencies
// these are not exposed to the user
// immer for immutable native js data structures
import {produce, enableMapSet} from 'immer';
enableMapSet();
// record and tuple for value-equal compound data structures
import {Record} from './record-tuple/record.js';
import {Tuple} from './record-tuple/tuple.js';

export let imports = {produce, Record, Tuple};

/////////////////// Errors & handling
// throws an error as a function rather than a statement
let raise = (error, message) => { throw new error(message) };

// sends its messages to the error console
let report = (...msgs) => {
  msgs.forEach(msg => console.error(msg));
};

// converts a function that throws to one that returns its error
let bound = fn => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return e;
  }
};

export let errors = {raise, report, bound};

/////////////////// Absolute core value functions
///// booleans
// better boolean: returns false only when an object is nullish or false
// js coerces many values (0, '', etc.) to false
let boolean = x => x == null || x === false ? false : true;

/////////////////// Functions
///// Utils
// renames a function
let rename = (name, fn) => Object.defineProperty(fn, 'name', {value: name});

///// Function application
// calls a function with the arguments passed in
let call = (fn, ...args) => fn(...args);

// calls a function with the arguments expressed as an iterable
let apply = (fn, args) => fn(...args);

// lisp-like, takes an interable with a function in the first
// position and uses the remainder as arguments
let ap = ([fn, ...args]) => fn(...args);

// apply a function partially
let partial = (fn, ...args1) => rename(
  `${fn.name}<partially applied>`, 
  (...args2) => call(fn, ...args1, ...args2));

///// Function dispatch

// create a function that dispatches on the number of arguments
// note that this throws if the arity does not match any of those passed in
// n_ary cannot be used to create indefinitely variadic functions:
// no args, no rest values
// TODO: consider if this should change
let n_ary = (name, ...fns) => {
  let arity_map = fns.reduce((map, fn) => Object.assign(map, {[fn.length]: fn}), {});

  let match_arity = (...args) => {
    let arity = args.length,
      match = arity_map[arity];

    return match 
      ? match(...args) 
      : raise(Error, `Wrong number of arguments to ${name}. It takes ${Object.keys(arity_map).join(' or ')} argument(s), but received ${args.length}.`) 
  };

  return rename(name, match_arity);

};

///// Multimethods
// multimethods allow for the calling of different functions based on
// the return value of a dispatching function

// a default method for multimethods
// just raises an error
// not exported
let method_not_found = (name) => (...args) =>
  raise(Error, 
    `No method found in multimethod ${name} with arguments (${args.map(a => a.toString()).join(', ')}).`)

// make a multimethod
// a multimethod dispatches on the value returned from the function `on`
// the optional third argument is the default function
// if no function is supplied, the default is to raise an error
let multi_tag = Symbol('ludus/multimethod');
let multi = (name, on, not_found = method_not_found(name)) => {
  let map = new Map();

  let dispatch = (...args) => {
    let fn = map.get(on(...args));
    return boolean(fn)
      ? fn(...args)
      : not_found(...args);
  };

  let set = (value, fn) => { map.set(value, fn); };
  let has = (value) => map.has(value);
  let methods = () => map.entries();
  let del = (value) => map.delete(value);

  return rename(name, 
    Object.defineProperty(dispatch, multi_tag, 
      {value: {set, has, methods, delete: del}}));
};

// adds a method (function) to a multimethod
let method = (multimethod, value, fn) => {
  multimethod[multi_tag].set(value, fn);
  return multimethod;
};

// lists the methods of a multimethod
let methods = (multimethod) => multimethod[multi_tag].methods();

// tells if a multimethod has a method defined for a particular value
let has_method = (multimethod, value) => multimethod[multi_tag].has(value);

// deletes a method from a multimethod
let delete_method = (multimethod, value) => 
  multimethod[multi_tag].delete(value);

///// Function combinators

// composes two functions
let compose = (f1, f2) => (...args) => f1(f2(...args));

// forwards the result of one function to the next
// reverses the argument order of compose
let forward = (f1, f2) => compose(f2, f1);

// creates a pipeline of functions
// the returned pipeline function takes a single argument
// if an error is thrown, it catches the error, reports it, and re-throws it
let pipe = (...fns) => rename('pipeline', x => {
  for (let fn of fns) {
    try {
      x = fn(x);
    } catch (e) {
      report(`Error in function pipeline while calling ${fn.name} with ${x}.`);
      throw e;
    }
  }
  return x;
});

// a function pipeline that short-circuits when it hits a null result
let pipe_some = (...fns) => rename('pipeline', x => {
  for (let f of fns) {
    try {
      x = f(x);
      if (x == null) return x;
    } catch (e) {
      report(`Error thrown in function while calling ${f.name} with ${x}.`);
      throw e;
    }
  }
  return x;
});

///// loop & recur
// loop & recur allow for tail-call-optimized single-recursion
// no mutual recursion, which frankly Ludus users are unlikely to need

// recur returns a special object that encapsulates arguments
// it has two symbol-keyed properties
// it also has a proxy that throws errors when anything else is accessed
// this allows for errors to be thrown when `recur` is used not in tail position
// in a function wrapped by `loop`
let recur_tag = Symbol('ludus/recur');
let recur_args = Symbol('ludus/recur/args');
let recur_handler = {
  get (target, prop) {
    if (prop === recur_tag || prop === recur_args) return target[prop];
    throw Error('recur must only be used in the tail position inside of loop.');
  },
  apply() {
    throw Error('recur must only be used in the tail position inside of loop.');
  }
};
let recur = (...args) => new Proxy({
  [recur_tag]: true, [recur_args]: args,
  [Symbol.toPrimitive] () {
    throw Error('recur must only be used in the tail position inside of loop.');
  },
  [Symbol.toString] () {
    throw Error('recur must only be used in the tail position inside of loop.');
  }
}, recur_handler);

// loop wraps a function that knows what to do with
// the optional second argument is the max number of recursive loops
// default value: 1,000,000
let loop = (fn, max_iter = 1000000) => {
  let looped = (...args) => {
    let result = fn(...args),
      iter = 0;
    while (result[recur_tag] && iter < max_iter) {
      result = fn(...result[recur_args]);
      iter += 1;
    }
    if (iter >= max_iter) throw Error(`Too much recursion in ${fn.name || 'anonymous function'}.`)
    return result;
  };

  return Object.defineProperties(looped, {
    name: {value: `${fn.name || 'anonymous'}<looped>`},
    length: {value: fn.length}
  })
};

///// other useful functional manipulations

// runs a function once, and afterwards returns the result
// (necessary for seq)
let never = Symbol('ludus/never');
let once = (fn) => {
  let result = never;
  return rename(fn.name, (...args) => {
    if (result === never) result = fn(...args);
    return result;
  });
};

// identity
let id = x => x;

// do nothing
let no_op = () => {};

///// defn

export let functions = {loop, recur, call, apply, ap, partial, n_ary, id, no_op, once, forward, compose, pipe, pipe_some, multi, method, has_method, methods, delete_method, rename };

//////////////////// Working with values
///// null
// returns true of something is null or undefined
let is_null = x => x == null;

// determines what to do when a value is nullish
let when_null = n_ary('when_null',
  (if_null) => partial(when_null, if_null),
  (if_null, value) => value == null ? if_null : value
);

///// Objects & records
// At least to start, Ludus has no notion of values other than
// bare "records": object literals with only string keys.
// This simplifies a great deal.
// In addition, this means that Ludus's type system is incredibly
// simple. It should be sufficient for at least the core system.

// tells if something is an object literal
let is_record = x => 
  x != null 
  && Reflect.getPrototypeOf(Reflect.getPrototypeOf(x)) === null;

// safer property access
// never throws
// returns null if something is absent
let get = n_ary('get',
  (key) => partial(get, key),
  (key, obj) => get(key, obj, null),
  (key, obj, if_absent) => obj == null 
    ? if_absent 
    : when_null(if_absent, obj[key])
);

let has = n_ary('has',
  (key) => partial(get, key),
  (key, obj) => boolean(get(key, obj))
);

// safe deep property access
// object-first
// keys (strings or numbers)
let get_in = n_ary('get_in',
  (obj) => partial(get_in, obj),
  (obj, keys) => get_in(obj, keys, null),
  (obj, keys, if_absent) => keys.reduce((o, k) => get(k, o, if_absent), obj)
);

export let values = {boolean, is_null, is_record, when_null, get, has, get_in}

//////////////////// Types
// Ludus's type system is orthogonal to Javascript's
// We know about a few builtin JS types, as below.
// We can learn about arbitrary additional JS types, but
// Ludus is not optimized for them: Ludus does not walk the
// inheritance tree, although it could be made to do so with the
// clever prototypes.
//
// Everything else is object literal/records with
// string keys, and a type tag that's a string: 'ludus/type/tag'
// Types themselves Records that hold symbols.

///// Constructed types

// A mapping of constructor names/type names to types
// to be accessed as types.String in multimethods
export let type_map = {
  String: Symbol('ludus/type/string'),
  Number: Symbol('ludus/type/number'),
  Boolean: Symbol('ludus/type/boolean'),
  Symbol: Symbol('ludus/type/symbol'),
  Function: Symbol('ludus/type/function'),
  Array: Symbol('ludus/type/array'),
  null: Symbol('ludus/type/null'),
  Object: Symbol('ludus/type/object'),
  Map: Symbol('ludus/type/map'),
  Set: Symbol('ludus/type/set'),
  unknown: Symbol('ludus/type/unknown'),
  Record: Symbol('ludus/type/record'),
  Tuple: Symbol('ludus/type/tuple')
};

// a plain string type tag
// use slashes so you can't use normal property access
let type_tag = 'ludus/type';

// a Map containing a mapping of builtin constructors to Ludus types
let constructors = new WeakMap([
  [String, type_map.String],
  [Number, type_map.Number],
  [Boolean, type_map.Boolean],
  [Symbol, type_map.Symbol],
  [Function, type_map.Function],
  [Array, type_map.Array],
  [Object, type_map.Object],
  [Map, type_map.Map],
  [Set, type_map.Set],
  [Record, type_map.Record],
  [Tuple, type_map.Tuple]
]);

// registers a constructor in the constructor map
// does not add it to the types object, however:
// references to the constructor tag have to be managed
let register_constructor = (constructor) => {
  if (constructors.has(constructor)) return constructors.get(constructor);

  let tag = Symbol(`ludus/type/${constructor.name}`);
  constructors.set(constructor, tag);
  return tag;
};

///// Ludus types
// Ludus types are unique Records, each having the shape
// {'ludus/type': Symbol}.
// They also have specs, which we keep track of in a map.
// 
let type_specs = new WeakMap();

let data = (name, spec) => {
  let tag = Symbol(`ludus/type/${name}`),
    type = Record({[type_tag]: tag});

  type_specs.set(type, spec);

  return type;
};

// create an object of a given type
let create = (type, obj) => {
  // check spec
  // if (!check(type_specs.get(type), obj)) throw
  return {[type_tag]: type, ...obj};
};

///// Getting types
// a function to get the type of a thing
let type = (x) => {
  // base case: null or undefined
  if (x == null) return type_map.null;

  // next: check if the object has a type tag
  let tagged_type = get(type_tag, x);
  if (boolean(tagged_type)) return tagged_type;

  let constructed_type = constructors.get(x.constructor);
  if (boolean(constructed_type)) return constructed_type;

  // finally, return an unknown type so users can extend the type system
  return type_map.unknown;
};

export let types = { type, create, data, register_constructor, map: type_map, ...type_map };

//////////////////// Sequences
// Sequences allow for abstracted lazy iteration across everything
// (well, almost everything): Arrays, Maps, Sets, Objects, Strings,
// generators, etc.

// a generator that iterates through the keys of an object
// only covers string keys
// only outputs own properties
// not exported
let obj_gen = function* (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) yield [key, obj[key]];
  }
};

let is_iterable = x => x != null && typeof x[Symbol.iterator] === 'function';

let iterate = lazy => {
  let first = lazy.first(),
    rest = lazy.rest();
  return {
    next () {
      if (rest === null) return {done: true}
      let next = {value: first, done: rest === null};
      first = rest.first();
      rest = rest.rest();
      return next;
    }
  }
}; 

let Seq = data('Seq');

let make_seq = (iterator) => {
  let current = iterator.next();
  let rest = once(() => current.done ? null : make_seq(iterator));
  let first = () => current.done ? null : current.value;
  let out = create(Seq, {
    [Symbol.iterator] () {
      return iterate(out);
    },
    rest,
    first
  });
  return out;
};

let seq = (seqable) => {
  if (boolean(get(type_tag, seqable))) return seqable;
  if (seqable == null) return seq([]);
  if (is_iterable(seqable)) return make_seq(seqable[Symbol.iterator]());
  if (is_record(seqable)) return make_seq(obj_gen(seqable));
  throw Error(`${seqable} is not seqable.`);
};

// TODO: decide if cons_gen should add the new element to the beginning or end
// makes sense to do it at the end for finite seqs
// but not for infinite ones
let cons_gen = function* (value, seq) {
  yield value;
  yield* seq;
}

let first = (seq_) => seq(seq_).first();

let rest = (seq_) => seq(seq_).rest();

let cons = (value, seq_) => seq(cons_gen(value, seq_));

//let conj = (seq_, value) => cons(value, seq_);
let conj = multi('conj', type, () => null)
method(conj, type_map.Array, 
  (arr, value) => produce(arr, draft => { draft.push(value); }));
method(conj, type_map.Object,
  (obj, [key, value]) => produce(obj, draft => { draft[key] = value; }));
method(conj, type_map.String,
  (str_1, str_2) => str_1.concat(str_2));
method(conj, type_map.Set,
  (set, value) => produce(set, draft => { draft.add(value); }));
method(conj, type_map.Map,
  (map, [key, value]) => produce(map, draft => draft.set(key, value)));
method(conj, Seq,
  (seq_, value) => seq(cons_gen(value, seq_)));
method(conj, type_map.null,
  (_, value) => conj(seq(null), value));

let empty = multi('empty', type, () => null);
method(empty, type_map.Array, () => []);
method(empty, type_map.Object, () => ({}));
method(empty, type_map.String, () => '');
method(empty, type_map.Set, () => new Set());
method(empty, type_map.Map, () => new Map());
method(empty, Seq, () => seq(null));
method(empty, type_map.null, () => null);

let count = multi('count', type, () => null);
method(count, type_map.Array, arr => arr.length);
method(count, type_map.String, str => str.length);
method(count, type_map.Set, set => set.size);
method(count, type_map.Map, map => map.size);
method(count, type_map.null, () => 0);
method(count, type_map.Object, obj => into([], obj).length);

let is_empty = seq_ => rest(seq(seq_)) === null;

// a handy wrapper for a generator function
// returns a lazy iterator over the generator
// TODO: add splats and `recur` to this to allow more robust generation
let generate = (init, step, done) => make_seq((function*() {
  let value = init; //=
  while(!done(value)) {
    yield value;
    value = step(value);
  }
})());

// produces a range of integers
let range = n_ary('range',
  (max) => range(0, max, 1),
  (start, max) => range(start, max, 1),
  (start, max, step) => generate(start, x => x + step, x => x >= max));

let cycle = (seqable) => make_seq((function*() {
    yield* seq(seqable);
    yield* cycle(seqable);
  })());

// interleaves seqs
// given a list of seqs, produce a seq that's the first element
// from each, then the second, until one of them is empty
let interleave = (...seqables) => make_seq((function* () {
  let seqs = map(seq, seqables);

  while (true) {
    if (some(is_empty, seqs)) return;
    let firsts = map(first, seqs);
    yield* firsts;
    seqs = map(rest, seqs);
  }
})());

let repeatedly = (value) => generate(value, id, () => false);

export let seqs = {repeatedly, interleave, cycle, range, generate, is_empty, count, empty, conj, rest, first, seq, Seq, is_iterable};

//////////////////// Transducers
let completed = Symbol('ludus/completed');
let complete = (accum) => ({value: accum, [completed]: true});

let reduce = n_ary('reduce', 
  (f, coll) => reduce(f, first(coll), rest(coll)),
  loop((f, accum, coll) => {
    let s = seq(coll);
    if (has(completed, accum)) return accum.value;
    if (is_empty(s)) return accum;
    return recur(f, f(accum, first(s)), rest(s));
  }));

let transduce = n_ary('transduce', 
  (xf, rf, coll) => reduce(xf(rf), coll),
  (xf, rf, accum, coll) => reduce(xf(rf), accum, coll));

let map = n_ary('map',
  (f) => (rf) => (accum, x) => rf(accum, f(x)),
  (f, coll) => transduce(map(f), conj, empty(coll), coll)
);

let filter = n_ary('filter',
  (f) => (rf) => (accum, x) => boolean(f(x)) ? rf(accum, x) : accum,
  (f, coll) => transduce(filter(f), conj, empty(coll), coll)
);

let into = n_ary('into',
  (to, from) => transduce(id, conj, to, from),
  (to, from, xform) => transduce(xform, conj, to, from)
);

let take = n_ary('take',
  (n) => {
    let count = 0;
    return (rf) => (accum, x) => {
      if (count >= n) return complete(accum);
      count += 1;
      return rf(accum, x);
    };
  },
  (n, coll) => transduce(take(n), conj, empty(coll), coll)
);

let keep = n_ary('keep',
  (f) => (rf) => (accum, x) => f(x) == null ? accum : rf(accum, x),
  (f, coll) => transduce(keep(f), conj, empty(coll), coll)
);

let every = n_ary('every',
  (f) => (rf) => (_, x) => boolean(f(x)) ? rf(true, true) : complete(false),
  (f, coll) => transduce(every(f), (x, y) => x && y, true, coll)
);

let some = n_ary('some',
  (f) => (rf) => (_, x) => boolean(f(x)) ? complete(true) : rf(false, false),
  (f, coll) => transduce(some(f), (x, y) => x || y, false, coll)
);

let chunk = n_ary('chunk',
  (n) => {
    let chunk = [];
    return (rf) => (accum, x) => {
      chunk = conj(chunk, x);
      if (chunk.length === n) {
        let out = chunk;
        chunk = [];
        return rf(accum, out)
      }
      return accum;
    };
  },
  (n, coll) => transduce(chunk(n), conj, empty(coll), coll)
);

let zip = (...seqs) => 
  transduce(chunk(seqs.length), conj, [], interleave(...seqs));

export let transducers = {reduce, transduce, into, map, complete, filter, take, zip, chunk, every, some, keep};

//////////////////// Spec
// spec offers a robust set of ways to combine predicate functions
// as well as some core predicates
// unlike a type system, spec can use arbitrary predicates
// and is fully exposed to the runtime

///// predicates
// TODO: add more useful predicates
let is = n_ary('is',
  (type) => rename(`is<${type.description}>`, partial(is, type)),
  (type_, value) => type(value) === type_
);

let is_string = s => typeof s === 'string';

let is_number = n => typeof n === 'number';

let is_int = n => is_number(n) && n % 1 === 0;

let is_boolean = b => typeof b === 'boolean';

let is_symbol = s => typeof s === 'symbol';

let is_object = o => is(type_map.Object, o);

let is_array = a => is(type_map.Array, a);

let is_map = m => is(type_map.Map, m);

let is_set = s => is(type_map.Set, s);

export let predicates = {is, is_string, is_number, is_int, is_boolean, is_symbol, is_object, is_array, is_map, is_set};

///// combinators
let spec_tag = Symbol('ludus/spec')

let spec = n_ary('spec',
  (name, predicate) => rename(name, predicate),
  (name, predicate, combinator, joins) => Object.defineProperties(
    predicate, {
      name: {value: name},
      [spec_tag]: {value: combinator},
      joins: {value: joins}
    })
);

let or = (...specs) => spec(
  `or<${specs.map(s => s.name).join(', ')}>`,
  value => specs.some(spec => spec(value)),
  or,
  specs
);

let and = (...specs) => spec(
  `and<${specs.map(s => s.name).join(', ')}>`,
  value => specs.every(spec => spec(value)),
  and,
  specs
);

let not = spec_ => spec(
  `not<${spec_.name}>`,
  value => !spec_(value),
  not,
  [spec_]
);

let maybe = (spec_) => spec(`maybe<${spec_.name}>`, or(spec_, is_null));

let property = (key, spec_) => spec(
  `property<${key}: ${spec_.name}>`,
  x => x != null && spec_(x[key]),
  property,
  [spec_]
);

let struct = (name, obj) => spec(
  `struct<${name}>`, 
  and(...Object.entries(obj).map(([key, spec_]) => property(key, spec_)))
);

let series = (...specs) => spec(
  `series<${specs.map(s => s.name).join(', ')}>`,
  xs => count(xs) === count(specs) && every(ap, zip(specs, xs)),
  series,
  specs
);

let many = (spec_) => spec(
  `many<${spec_.name}>`,
  xs => every(ap, zip(repeatedly(spec_), xs)),
  many,
  [spec_]
);

///// working with predicates
let check = (spec, value) => spec(value);

let invalid = Symbol('ludus/spec/invalid');

let is_invalid = x => x === invalid;

let conform = (spec, value) => spec(value) ? value : invalid;

let assert = (spec, value) => spec(value) 
  ? value 
  : raise(Error, `${value} did not conform to ${spec.name}`);
  
// TODO: add an explanation regime
// explain should be a recursive multimethod that accumulates failures


//////////////////// Exports
let core = {imports, errors, functions, transducers, predicates, values, seqs, types };
export default core;

//////////////////// REPL workspace

conj([0], 1) //=
conj({b: 2}, ['a', 1]) //=
conj('foo', 'bar') //=
conj(new Set('a'), 'b') //=
conj(new Map([['quux', 'quuz']]), ['foo', 'bar']) //=

for (let x of conj(seq([1, 2, 3]), 0)) {
  x
}

// hold onto these

// number functions
let inc = (x) => x + 1;

let add = (x, y) => x + y;

let neg = (x) => x * -1;

let is_even = x => x % 2 === 0;

