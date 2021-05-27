// predicates
let is_string = s => typeof s === 'string';

let is_number = n => typeof n === 'number';

let is_boolean = b => typeof b === 'boolean';

let is_symbol = s => typeof s === 'symbol';

let is_null = n => n == null;

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

let maybe = spec => rename(`maybe<${spec.name}>`, or(spec, is_null));

let property = (key, spec) => Object.defineProperties(
  x => x != null && spec(x[key]),
  {
    name: {value: `property<${key}: ${spec.name}>`},
    [spec_tag]: {value: property},
    joins: [spec]
  }
);

let struct = (name, obj) => rename(
  `struct<${name}>`, 
  and(...Object.entries(obj).map(([key, spec]) => property(key, spec))));

let tup = (...specs) => rename(`tup${specs.map(s => s.name).join(', ')}`, 
  and(value => value.length === specs.length, protocol('tuple', specs))
);

class SpecError extends Error {};

let raise = (error, message) => { throw new error(message); }

let invalid = Symbol('ludus/spec/invalid');

let check = (spec, value) => spec(value);

let is_invalid = x => x === invalid;

let conform = (spec, value) => spec(value) ? value : invalid;

let assert = (spec, value) => spec(value) 
  ? value 
  : raise(SpecError, `${value} did not conform to spec: ${spec.name}.`);

// explain needs work; should be a multimethod, akin to show
let fail_tag = Symbol('lydus/spec/failure');

let fail = (spec, failures = null) => ({[fail_tag]: spec, failures}) 

let find_failures = (spec, value) => {
  if (check(spec, value)) return null;
  if (spec.joins) {
    let failures = spec.joins.map(s => find_failures(s, value)).filter(f => f);
    return fail(spec, failures);
  }
  return fail(spec);
};

let explain = (spec, value) => {
  let failures = find_failures(spec, value);
  if (failures === null) return `${value} conforms to spec ${spec.name}`;

  return `${value} did not conform to spec because it failed ${spec.name}:
  ${failures.failures.map(f => f[fail_tag].name).join('\n')}`
};

let str_or_num = or(is_string, is_number);

let foobar = struct('foobar', {foo: is_string, bar: maybe(str_or_num)});

explain(maybe(str_or_num), true) //=
explain(foobar, {bar: {}}) //= 

////// below here, function decorators
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

