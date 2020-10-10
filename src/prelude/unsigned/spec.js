import L from './base.js';
import P from './preds.js';

let {Type, NS} = L;

///// Spec definition
// a Spec type
let Spec = Type.deftype({name: 'Spec'});

// def :: ({name: string?, pred: function, ...rest}) => Spec
// Defines a Spec, taking at minimum a predicate. If no name is
// specified in attrs, it pulls the name from the predicate, allowing
// `def({pred: is_string})`.
let def = (attrs) => {
  let name = attrs.name ?? attrs.pred?.name;
  return Type.create(Spec, {spec: def, ...attrs, name});
}; 

///// Spec utils
// a handy helper to rename specs
let rename = (name, spec) => Object.defineProperty(spec, 'name', {value: name});

// show :: (spec) => string
// Gives a string representation of a spec
let show = (spec) => `Spec: ${spec.name}`;

// is_spec :: (any) => boolean
// Tells if something is a spec
let is_spec = (x) => Type.is(Spec, x);

///// Spec validation
// is_valid :: (spec, value) => boolean
// The equivalent of valid? in clj; tells whether a value passes a spec
let is_valid = (spec, value) => is_spec(spec) 
  ? P.bool(spec.pred(value))
  : P.bool(spec(value));

///// Spec combinators
// Note that spec combinators combine *specs*, not their predicates.
// All of the functions below *take a spec* and *return a spec*.

// or :: (...specs) => spec
// Combines specs with a boolean or.
let or = (...specs) => {
  let name = `or<${specs.map((s) => s.name)}>`;
  let pred = P.or(...specs.map((s) => s.pred));
  return def({name, pred, spec: or, members: specs});
};

// and :: (...specs) => spec
// Combines specs with a boolean and.
let and = (...specs) => {
  let name = `and<${specs.map((s) => s.name)}>`;
  let pred = P.and(...specs.map((s) => s.pred));
  return def({name, pred, spec: and, members: specs});
};

// tup :: (...specs) => spec
// Combines specs into a tuple.
let tup = (...specs) => {
  let name = `tup<${specs.map((s) => s.name)}>`;
  let pred = (tup) => {
    if (specs.length !== tup.length) return false;
    for (let i = 0; i < specs.length; i++) {
      if (!is_valid(specs[i], tup[i])) return false;
    }
    return true;
  };
  return def({name, pred, spec: tup, members: specs});
};

// seq :: (...specs) => spec
// Combines specs into a sequence
let seq = (spec) => {
  let name = `seq<${spec.name}>`;
  let pred = (seq) => {
    for (let el of seq) {
      if (!is_valid(spec, el)) return false;
    }
    return true;
  }
  return def({name, pred, spec: seq, members: spec});
};

// key :: (string, spec) => spec
// Takes a field and a spec, and returns a spec that describes
// a the value of an object at that key.
let key = (the_key, spec) => {
  let name = `key<${the_key}>`;
  let pred = (obj) => is_valid(spec, obj[the_key]);
  return def({name, pred, spec: key, members: spec});
};

// record :: (string, dict(specs)) => spec
// Takes a name and an object that's a dictionary of specs,
// and returns a spec that describes a set of fields on an object,
// with specs corresponding to the keys on the passed dictionary.
let record = (name, map) => {
  let key_map = Object.keys(map).reduce(
    (m, k) => { m[k] = key({[k]: map[k]}); return m; },
    {}
  );
  let keys = Object.values(key_map);
  let spec = and(...keys);
  return rename(name, spec);
};

///// Useful specs
let boolean = def({name: 'boolean', pred: P.is_bool});
let string = def({name: 'string', pred: P.is_string});
let number = def({name: 'number', pred: P.is_number});
let symbol = def({name: 'symbol', pred: P.is_symbol});
let undef = def({name: 'undefined', pred: P.is_undef});
let array = def({name: 'array', pred: P.is_array});
let some = def({name: 'some', pred: P.is_some});
let fn = def({name: 'function', pred: P.is_fn});
let obj = def({name: 'object', pred: P.is_obj});
let assoc = def({name: 'assoc', pred: P.is_assoc});
let iter = def({name: 'iter', pred: P.is_iter});
let sequence = def({name: 'sequence', pred: P.is_sequence});
let dict = (spec) => def({name: `dict<${spec.name}>`,
  pred: (x) => P.is_assoc(x) && Object.values(x).every((v) => is_valid(spec, v)), 
  members: spec});
let type = (type) => def({name: type.name, 
  pred: (x) => is(type, x), 
  members: type});
let maybe = (spec) => rename(`maybe<${spec.name}>`, or(undef, spec));

///// Function speccing
let args = (...tups) => {
  // validate arg tuples
  let lengths = [];
  for (let tup of tups) {
    if (lengths.includes(tup.length)) throw Error(`Arguments cannot contain multiple tuples of the same length. Received more than one tuple of length ${tup.length}`);
    lengths.push(tup.length);
  }
  let arg_tuples = tups.map((t) => tup(...t));
  let arg_spec = or(...arg_tuples);
  let pred = arg_spec.pred;
  // TODO: give this a nicer name?--or leave the plumbing exposed?
  return def({name: `args<${arg_tuples.map((t) => t.members.map((m) => m.name).join(', ')).join(' | ')}>`,
    pred, members: arg_tuples});
};

let explain = (spec, value) => {
  if (is_valid(spec, value)) return undefined;
  return `${value} did not conform to ${spec}`;
};

export default NS.defns({type: Spec, members: {
  Spec, defspec: def, show, is_spec, is_valid, and, or, tup, seq, key, record,
  boolean, string, number, symbol, array, some, function: fn, obj,
  assoc, iter, sequence, dict, type, maybe, args, explain
}});

explain(args([number], [number, string]), ['']) //?