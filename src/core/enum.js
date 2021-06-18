import '../prelude/prelude.js';

let typify = (name) => str(name, '_t');

let enumeration = ({name, ...variants}) => {
  let variant_types = into({}, map((name) => [typify(name), type({name: capitalize(name)})]), keys(variants));
  let enum_type = type({name, variants: variant_types});
  let variant_fns = into({}, map(([name, f]) => [name, fn(name, (...args) => create(enum_type, {value: create(get(typify(name), variant_types), {value: f(...args)})}))]), variants);
  enum_type.fns = variant_fns;
  return enum_type;
};

let no_op = () => {};

let option_t = enumeration({name: 'Option', 
  some: fn({name: 'some', pre: args([is_some]), body: (x) => x}), 
  none: no_op
});
let {some, none} = get('fns', option_t);
let {some_t, none_t} = get('variants', option_t); //?

let result_t = enumeration({name: 'Result',
  err: id,
  ok: id
});
let {fns: {err, ok}, variants: {err_t, ok_t}} = result_t;

let match = (value, ...clauses) => {
  let type_ = type_of(value);
  let boxed_value = get('value', value);
  let type_branches = assert(
    get('variants', type_), 
    `match can only be used with enumerations.`);
  let match_branches = into({}, map((t) => [typify(lowcase(get('name', t))), t]), map(first, clauses));
  assert(
    eq(type_branches, match_branches), 
    `match clauses must include all variants of a type, and only variants of a type.`);
  return Ducers.some(([t, f]) => when(is(t, boxed_value)) ? f(boxed_value) : undefined, clauses);
};

let fmatch = (t, ...clauses) => {
  let type_branches = assert(
    get('variants', t), 
    `match can only be used with enumerations.`);
  let match_branches = into({}, map((t) => [typify(lowcase(get('name', t))), t]), map(first, clauses));
  assert(
    eq(type_branches, match_branches), 
    `match clauses must include all variants of a type, and only variants of a type.`);
  return fn({name: 'fmatch_fn', pre: args([is(t)]), 
    body: (value) => {
      let boxed_value = get('value', value);
      return Ducers.some(([t, f]) => when(is(t, boxed_value)) ? f(boxed_value) : undefined, clauses);
    }
  });
};

let show = (opt) => match(opt,
  [some_t, ({value}) => `Some{${Ludus.show(value)}}`],
  [none_t, () => `None`]
);

export default ns({type: option_t, members: {
  show
}});

match(none(),
  [some_t, just('some!')],
  [none_t, just('none!')],
  //[option_t, ]
); //?

some('foo'); //?

match(ok('fuck!'), 
  [ok_t, ({value}) => value],
  [err_t, ({value}) => raise(value)]
); //?