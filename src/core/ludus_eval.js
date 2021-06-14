import LP from './ludus_parser.js';
import Parse from './parse.js';

let forbidden = ['quux', 'quuz', 'when'];

let ctx = ['foo', 'bar'];

let repl_ctx = {
  higher: ['foo', 'bar'], // global
  current: [],
  toplevel: true
};

let input1 = `let quul = (foo) => {
  quul;
  let fool = 42;
  let baz = 23;
  let bar = 12;
};`;

let input2 = `let quux = quux(42);`;

let parsed1 = Parse.run(LP.repl_line, input1);

let parsed2 = Parse.run(LP.repl_line, input2);

let ast1 = get('result', parsed1);//?

let errs1 = get('errors', parsed1); //?

let ast2 = get('result', parsed2);

let errs2 = get('errors', parsed2);

let ctx_includes_id = (ctx, id) => includes(id, concat(get('higher', ctx), get('current', ctx)));

let check_name = fn('check_name', [
  (ctx) => partial(check_name, ctx),
  ({higher, current}, name) => {
    let forbidden_err = when(includes(name, forbidden))
      ? raise(`Cannot use reserved word ${name} as identifier.`)
      : undefined;
    let shadow_warn = when(includes(name, higher))
      ? warn(`Shadowed name ${name}.`)
      : undefined;
    let redefinition_err = when(and(not(get('toplevel', ctx)), includes(name, current)))
      ? raise(`Cannot redeclare identifier ${name}.`)
      : undefined;
    return name;
  }
  ]);

let handlers = {
  atom: (_) => true,
  identifier: (ctx, value) => when(ctx_includes_id(ctx, value))
    ? true
    : raise(`Unbound identifier ${value}.`),
  
  call: (ctx, {called, args}) => and(check_ids(ctx, called), every(check_ids(ctx), args)),
  
  let: (ctx, {identifier, expression}) => {
    let id_name = get('value', identifier);
    // when the expression defines a function, we need the function name
    // available within that function (for recursive calls), so we
    // create a new intermediate context
    let new_ctx = when(eq('function', get_in(expression, ['value', 'type'])))
      ? {higher: [...get('higher', ctx), ...get('current', ctx)],
        current: [id_name]}
      : ctx;
    let is_expr_good = check_ids(new_ctx, expression);
    return when(is_expr_good)
      ? when(check_name(ctx, id_name))
        ? and(Arr.conj_(get('current', ctx), id_name), true)
        : false 
      : false;
  },

  function: (ctx, {params, body}) => {
    // a function gets a new context
    let inner_ctx = {
      higher: [...get('higher', ctx), ...get('current', ctx)],
      current: []};
    return and(
      check_ids(inner_ctx, params), 
      check_ids(inner_ctx, body));
  },

  params: (ctx, param_list) => {
    let param_names = into([], map(pipe(get('value'), check_name(ctx))), param_list);
    return reduce(Arr.conj_, get('current', ctx), param_names);
  },

  block: (ctx, block) => every(check_ids(ctx), block),

  array: () => {},

  object: () => {},

  pair: () => {},

  splat: () => {},

  when: () => {},

  ns_import: () => {},

  imports: () => {}
};

let check_ids = fn(
  'check_ids', 
  [
  (ctx) => partial(check_ids, ctx),
  (ctx, ast) => {
    let {type, value} = ast;
    return when(value)
      ? get(type, handlers, check_ids)(ctx, value)
      : 'whoops'; 
  }
  ]
);  

check_ids(repl_ctx, ast1); //?
//check_ids(repl_ctx, ast2); //?
