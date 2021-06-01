//////////////////// Spec
// Specs are composable guards, mostly used for runtime argument typechecking
// for Ludus-instrumented functions.

import L from './base.js';
import P from './preds.js';

let {Type, NS} = L;
let {ns} = NS;

///// Spec definition
// a Spec type
let spec_t = Type.deftype({name: 'Spec'});

// def :: ({name: string?, pred: function, ...rest}) => Spec
// Defines a Spec, taking at minimum a predicate. If no name is
// specified in attrs, it pulls the name from the predicate, allowing
// `def({pred: is_string})`.
let defspec = (attrs) => {
  let name = attrs.name != undefined 
    ? attrs.name 
    : attrs.pred && attrs.pred.name;
  return Type.create(spec_t, {spec: defspec, ...attrs, name});
}; 

///// Spec utils
// a handy helper to rename specs
let rename = (name, spec) => Object.defineProperty(spec, 'name', {value: name});

// show :: (spec) => string
// Gives a string representation of a spec
let show = (spec) => `spec:{${spec.name}}`;

// is_spec :: (any) => boolean
// Tells if something is a spec
let is_spec = (x) => Type.is(spec_t, x);

///// Spec validation
// is_valid :: (spec, value) => boolean
// The equivalent of valid? in clj; tells whether a value passes a spec
let is_valid_recursive = (spec, value) => is_spec(spec) 
  ? is_valid(spec.pred, value)
  : P.bool(spec(value));

// since is_valid gets called over and over again
// here's a faster, non-recursive version
let is_valid = (spec, value) => {
  while (typeof spec !== 'function') {
    spec = spec.pred;
  }
  return P.bool(spec(value));
}

///// Spec combinators
// Note that spec combinators combine *specs*, not their predicates.
// All of the functions below *take a spec* and *return a spec*.

// or :: (...specs) => spec
// Combines specs with a boolean or.
let or = (...specs) => {
  let name = `or<${specs.map((s) => s.name)}>`;
  let specced = specs.map((s) => 
    is_spec(s)? s : defspec({pred: s}));
  let pred = P.or(...specced.map((s) => s.pred));
  return defspec({name, pred, spec: or, members: specs});
};

// and :: (...specs) => spec
// Combines specs with a boolean and.
let and = (...specs) => {
  let name = `and<${specs.map((s) => s.name)}>`;
  let specced = specs.map((s) => 
    is_spec(s) ? s : defspec({pred: s}));
  let pred = P.and(...specced.map((s) => s.pred));
  return defspec({name, pred, spec: and, members: specs});
};

// tup :: (...specs) => spec
// Combines specs into a tuple
// A tuple matches on position in an array
// e.g. `tup(string, number)` matches `['foo', 42]`
let tup = (...specs) => {
  let name = `tup<${specs.map((s) => s.name)}>`;
  let pred = (tup) => {
    if (specs.length !== tup.length) return false;
    for (let i = 0; i < specs.length; i++) {
      if (!is_valid(specs[i], tup[i])) return false;
    }
    return true;
  };
  return defspec({name, pred, spec: tup, members: specs});
};

// seq :: (spec) => spec
// Tests if every element of a seq matches a spec.
let seq = (spec) => {
  let name = `seq<${spec.name}>`;
  let pred = (seq) => {
    if (!P.is_iter(seq)) return false;
    for (let el of seq) {
      if (!is_valid(spec, el)) return false;
    }
    return true;
  }
  return defspec({name, pred, spec: seq, members: spec});
};

// key :: (string, spec) => spec
// Takes a field and a spec, and returns a spec that describes
// a the value of an object at that key.
let at = (key, spec) => {
  let name = `at<${key}: ${spec.name}>`;
  let pred = (obj) => obj != undefined && is_valid(spec, obj[key]);
  return defspec({name, pred, spec: at, members: {key, spec}});
};

// record :: (string, dict(specs)) => spec
// Takes a name and an object that's a dictionary of specs,
// and returns a spec that describes a set of fields on an object,
// with specs corresponding to the keys on the passed dictionary.
let record = (name, map) => {
  let key_map = Object.keys(map).reduce(
    (m, k) => { m[k] = at(k, map[k]); return m; },
    {}
  );
  let keys = Object.values(key_map);
  let spec = and(...keys);
  return rename(name, spec);
};

///// Useful specs
let any = defspec({name: 'any', pred: (_) => true});
let bool = defspec({name: 'bool', pred: P.is_bool});
let str = defspec({name: 'str', pred: P.is_string});
let num = defspec({name: 'num', pred: P.is_number});
let int = defspec({name: 'int', pred: P.is_int});
let key = defspec({name: 'key', pred: P.or(P.is_string, P.is_number)});
//let symbol = def({name: 'symbol', pred: P.is_symbol});
let undef = defspec({name: 'undef', pred: P.is_undef});
let arr = defspec({name: 'arr', pred: P.is_array});
let some = defspec({name: 'some', pred: P.is_some});
let fn = defspec({name: 'fn', pred: P.is_fn});
let obj = defspec({name: 'obj', pred: P.is_obj});
let assoc = defspec({name: 'assoc', pred: P.is_assoc});
let iter = defspec({name: 'iter', pred: P.is_iter});
let coll = rename('coll', or(assoc, iter));
let sequence = defspec({name: 'sequence', pred: P.is_sequence});
let dict = (spec) => defspec({name: `dict<${spec.name}>`,
  pred: (x) => P.is_assoc(x) && Object.values(x).every((v) => is_valid(spec, v)), 
  spec: dict,
  members: spec});
let not_empty = defspec({name: 'not_empty', pred: P.is_not_empty});
let type = (t) => defspec({name: t.name, 
  pred: (x) => Type.is(t, x), 
  spec: type,
  members: t});
let maybe = (spec) => rename(`maybe<${spec.name}>`, or(undef, spec));

///// Function speccing
let args = (...tups) => {
  // validate arg tuples
  let lengths = [];
  let max_arity = 0;
  let longest;
  for (let tup of tups) {
    if (lengths.includes(tup.length)) throw Error(`Arguments cannot contain multiple tuples of the same length. Received more than one tuple of length ${tup.length}`);
    lengths.push(tup.length);
    if (max_arity < tup.length) {
      max_arity = tup.length;
      longest = tup;
    }
  }
  let arg_tuples = tups.map((t) => tup(...t));
  let arg_spec = or(...arg_tuples);
  let pred = (args) => {
    let explicit = args.slice(0, max_arity);
    let rest = args.slice(max_arity);
    return arg_spec.pred(explicit)
      && seq(longest[longest.length - 1]).pred(rest);
  };
  // TODO: give this a nicer name?--or leave the plumbing exposed?
  return defspec({name: `args<${arg_tuples.map((t) => t.members.map((m) => m.name).join(', ')).join(' | ')}>`,
    pred, spec: args, members: arg_tuples});
};

// TODO: review, improve, simplify this
let explain = (spec, value, indent = 0) => {
  let shown = L.show(value);
  let pad = ' '.repeat(indent);
  if (is_valid(spec, value)) return `${shown} passes ${spec.name}`;
  switch (spec.spec) {
    case and: {
      let msg = `${shown} failed ${spec.name}:\n`;
      let msgs = [];
      for (let mem of spec.members) {
        if (!is_valid(mem, value))
          msgs.push(pad + explain(mem, value, indent + 2));
      }
      return msg + msgs.join('\n');
    }
    case or: {
      let msg = `${shown} failed ${spec.name}:\n`;
      let msgs = [];
      for (let mem of spec.members) { 
        msgs.push(pad + explain(mem, value, indent + 2));
      }
      return msg + msgs.join('\n');
    }
    case tup: {
      let mems = spec.members;
      let length = mems.length;
      let msg = `${shown} failed ${spec.name}:\n`;
      if (!P.is_array(value)) {
        return msg + pad + `${shown} is not an array. Tuples must be arrays.`
      }
      if (value.length !== length) {
        return msg + pad + `Length mismatch. Expected: ${length}; received: ${value.length}.`;
      }
      let msgs = [];
      for (let i = 0; i < length; i++) {
        let mem = mems[i];
        let val = value[i];
        if (is_valid(mem, val)) {
          msgs.push(pad + `At ${i}: ${L.show(val)} passes ${mem.name}.`);
        } else {
          msgs.push(pad + `At ${i}: ${explain(mem, val, indent + 2)}`);
        }
      }
      return msg + msgs.join('\n');
    }
    case seq: {
      let msg = `${shown} fails ${spec.name}: `;
      if (!P.is_sequence(value)) {
        return msg + `${shown} is not a sequence.`;
      }
      let mem = spec.members;
      let i = 0;
      for (let x of value) {
        if (!is_valid(mem, x)) {
          return msg + '\n' + pad + `At ${i}: ${explain(mem, x, indent + 2)}`;
        }
        i++;
      }
    }
    case at: { 
      let s = spec.members.spec;
      let key = spec.members.key;
      let val = value != undefined ? value[key] : undefined;
      return `${shown} fails ${spec.name}\n${pad}At ${key}: ${explain(s, val, indent + 2)}`;
    }
    case record: {
      let msg = `${shown} failed ${spec.name}:\n`;
      let msgs = [];
      for (let mem of spec.members) {
        let key = mem.members.key;
        let val = value == undefined ? undefined : value[key];
        if (!is_valid(mem, val)) {
          msgs.push(pad + explain(mem, {[key]: val}, indent + 2));
        }
      }
      return msg + msgs.join('\n');
    }
    case dict: {
      let msg = `${shown} failed ${spec.name}:`;
      if (!P.is_assoc(value)) {
        return msg + `Dicts must be associative.`;
      }
      let s = spec.members;
      let msgs = [];
      for (let [k, v] of Object.entries(value)) {
        if (!is_valid(s, v))
          msgs.push(pad + `At ${k}: ${explain(s, v, indent + 2)}`);
      }
      return msg + '\n' + msgs.join('\n');
    }
    case type: {
      return `${shown} failed ${spec.name}: Expected ${spec.members} but received ${Type.type_of(value)}.`;
    }
    case args: {
      let max_arity = 0;
      let arity_map = {};
      for (let s of spec.members) {
        let len = s.members.length;
        max_arity = Math.max(max_arity, len);
        arity_map[len] = s;
      }
      let num_args = value.length;
      let arg_tuple = arity_map[Math.min(num_args, max_arity)];
      if (arg_tuple == undefined) {
        return `${shown} failed ${spec.name}: Wrong number of arguments. Expected ${Object.keys(arity_map).join(' | ')} but received ${num_args}.`
      }
      if (num_args <= max_arity) {
        return `${shown} failed ${spec.name}:\n${pad}${explain(arg_tuple, value, indent + 2)}`;
      }
      let explicit = value.slice(0, max_arity);
      let rest = value.slice(max_arity);
      let tup_msgs = [];
      for (let i = 0; i < max_arity; i++) {
        let arg = explicit[i];
        let arg_spec = arg_tuple.members[i];
        if (is_valid(arg_spec, arg)) {
          tup_msgs.push(`At ${i}: ${L.show(arg)} passes ${arg_spec.name}.`);
        } else {
          tup_msgs.push(`At ${i}: ${explain(arg_spec, arg, indent + 2)}`);
        }
      }
      let rest_msgs = [];
      let rest_spec = arg_tuple.members[max_arity - 1];
      for (let i = 0; i < rest.length; i ++) {
        if (is_valid(rest_spec, rest[i])) {
          rest_msgs.push(pad + `At ${i + max_arity}: ${L.show(rest[i])} passes ${rest_spec.name}.`)
        } else {
          rest_msgs.push(pad + `At ${i + max_arity}: ${explain(rest_spec, rest[i], indent + 2)}`);
        }
      }
      return `${shown} failed ${spec.name}\nwith <${arg_tuple.members.map((s) => s.name).join(', ')}>:\n${[...tup_msgs, ...rest_msgs].join('\n')}`;
    }
    default:
      return `${shown} fails ${spec.name}.`;
  }
};

export default ns({
  type: spec_t,
  members: {
    defspec, show, is_spec, is_valid, rename, // utils
    and, or, tup, seq, at, record, // combinators
    any, bool, str, num, int, key, arr, some, undef, fn, obj,
    assoc, iter, coll, not_empty, sequence, // useful
    dict, type, maybe, args, // parametric
    explain // and explain
  }
});

let named_or_typed = or(at('name', str), at('type', type(Type.t)));
let with_members = at('members', obj);
let ns_descriptor = defspec({name: 'ns_descriptor', pred: and(named_or_typed, with_members)});
let ns_args = args([ns_descriptor], [type(NS.t), obj]);