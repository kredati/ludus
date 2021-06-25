//////////////////// `doc`
// Shows documentation for Ludus functions
// TODO: update this once I bring in changes from `optimize-fns`


import '../signed/mod.js';

let doc_method = (method) => {
  let name = get('name', method);
  let docstring = get('doc', method, '');
  return `${name}::method\n${docstring}`;
};

let doc_ludus_fn = (fn) => {
  let name = get('name', fn);
  let docstring = get('doc', fn);
  let arities = map(get('length'), get('clauses', fn));
  let params = into({}, map(
    (f) => [get('length', f), thread(f, str, split('=>'), first, trim, (ps) => when(eq(get('length', f), 1)) ? parenthesize_single_param(ps) : ps)],
    get('clauses', fn)));
  let spec_raw = map(
    get('members'),
    get_in(fn, ['pre', 'members'], []));
  let render_spec = pipe(
    (x) => map(get('name'), x),
    join_with(', '),
    (x) => str('(', x, ')')
  );
  let pretty_specs = into({}, map((spec) => [count(spec), render_spec(spec)], spec_raw)); //?
  let arities_and_specs = Str.from(map((arity) => {
    let param_str = get(arity, params);
    let spec_str = get(arity, pretty_specs);
    return when(spec_str) ? str(param_str, '::', spec_str) : param_str;
  }, arities), '\n');
  let ns = get('in_ns', fn);
  let ns_name = when(ns)
    ? str(slice(show(ns), 4, sub(count(show(ns)), 1)), '.')
    : '';
  return `${ns_name}${name}::function\n${arities_and_specs}\n${or(docstring, '')}`;
};

let parenthesize_single_param = (param) => when(eq('(', first(param))) ? param : `(${param})`;

let doc_js_fn = (f) => {
  let name = get('name', f, 'anon. fn');
  let params = thread(f, str, split('=>'), first, trim, (ps) => when(eq(get('length', f), 1)) ? parenthesize_single_param(ps) : ps);
  return `${name}::function\n${params}`;
};

let doc_fn = (f) => cond(get('type', f),
  [eq(fn),      () => doc_ludus_fn(f)],
  [eq(method),  () => doc_method(f)],
  [is_any,      () => doc_js_fn(f)]
);

let doc = fn({
  name: 'doc',
  doc: 'Shows the documentation for a ludus value.',
  body: (x) => handle(
    () => when(is_fn(x)) ? doc_fn(x) : get('doc', x, 'no doc'), 
    just('no doc!'))
});

export {doc};
