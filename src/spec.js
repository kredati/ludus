import { show } from './show.js';

// predicates
let is_string = s => typeof s === 'string';

let is_number = n => typeof n === 'number';

let is_boolean = b => typeof b === 'boolean';

let is_symbol = s => typeof s === 'symbol';

let is_undefined = u => u === undefined;

let is_null = n => n === null;

let is_nil = n => n == null;

let is_object = o => o !== null && typeof o === 'object';

let is_function = f => typeof f === 'function';

let is_array = a => Array.isArray(a);

let is_record = r => is_object(r) 
  && Object.getPrototypeOf(Object.getPrototypeOf(r)) === null
  && Object.getOwnPropertySymbols(r).length === 0

// predicate combinators

let rename = (name, f) => Object.defineProperty(f, 'name', {value: name});

// Note to self:
// a strategy for getting specs to work
// there are really only three core combinators
// and, or, not
// and so each of these should carry metadata
// - that it is a combinator
// - what it is over
// this is very simple
// spec/explain can then do the messy work of figuring out
// how to present spec failures

let spec_tag = Symbol('ludus/spec')

let or = (...specs) => Object.defineProperties(
  value => specs.some(spec => spec(value)),
  {
    name: {value: `or<${specs.map(s => s.name).join(', ')}>`},
    [spec_tag]: {value: or},
    joins: {value: specs}
  }
);

let and = (...specs) => Object.defineProperties(
  value => specs.every(spec => spec(value)),
  {
    name: {value: `and<${specs.map(s => s.name).join(', ')}>`},
    [spec_tag]: {value: and},
    joins: {value: specs}
  }
);

let not = spec => Object.defineProperties(
  value => !spec(value),
  {
    name: {value: `not<${spec.name}>`},
    [spec_tag]: {value: not},
    joins: [spec]
  }
);

let maybe = spec => rename(`maybe<${spec.name}>`, or(spec, is_nil));

let nullable = spec => rename(`nullable<${spec.name}>`, or(spec, is_null));

let tuple = (...specs) => rename(
  `tuple<${specs.map(f => f.name).join(', ')}>`,
  value => 
    is_array(value) 
    && value.length === specs.length
    && specs.every((spec, i) => spec(value[i])));

let property = (key, spec) => rename(
  `property<${key}: ${spec.name}>`,
  x => x != null && spec(x[key]));

let record = (name, record) => rename(
  `record<${name}>`, 
  and(...Object.entries(record).map(([key, spec]) => property(key, spec))));

class SpecError extends Error {};

let raise = (error, message) => { throw new error(message); }

let invalid = {};

let check = (spec, value) => spec(value);

let conform = (spec, value) => spec(value) ? value : invalid;

let assert = (spec, value) => spec(value) ? value : raise(SpecError, `${show(value)} did not conform to spec: ${spec.name}.`);

let annotate = (fn, {takes, returns, name = fn.name || 'anonymous'}) => 
  Object.defineProperties(
    fn, 
    {['spec/takes']: {value: takes}, 
     ['spec/returns']: {value: returns}, 
     name: {value: name}});

let guard = annotated => {
  let arg_guard = tuple(...annotated['spec/takes']);
  let return_guard = annotated['spec/returns'];
  let guarded = (...args) => {
    let _args = conform(arg_guard, args);
    if (_args === invalid) raise(SpecError, `Arguments to ${annotated.name} did not conform to spec. \nExpected: ${arg_guard.name} \nReceived: ${show(args)}.`);
    let returns = annotated(..._args);
    let _returns = conform(return_guard, returns);
    if (_returns === invalid) raise(SpecError, `Returns from ${annotated.name} did not conform to spec. \nExpected: ${return_guard.name}. \nReceived: ${show(returns)}.`);
    return returns;
  };
  return Object.defineProperty(guarded, 'name', {value: annotated.name});
};

let protect = annotated => {
  let protected = (...args) => {
    try {
      return annotated(...args);
    } catch (e) {
      return guard(annotated)(...args);
    }
  }
  return Object.defineProperty(protected, 'name', {value: annotated.name});
};

