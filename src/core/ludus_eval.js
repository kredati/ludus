//////////////////// Ludus REPL Evaluator
// A beast of a function to check IDs and do small transforms for one-statement
// at a time REPL interaction.

// TODO:
// [ ] Complete handlers for all node types
// [ ] Add line numbers to ID nodes where we can get errors
// [ ] Devise transforms:
//    [ ] Subsequent `let`s at REPL for same ID simply lose the `let`.
//    [ ] `import`s become async functions
//    ^ because we only do one statement at a time in the REPL, we don't have to worry about line numbers or the parser forwarding the code in the statement.


import LP from './ludus_parser.js';
import Parse from './parse.js';

let forbidden = ['quux', 'quuz', 'when'];

let ctx = ['foo', 'bar'];

let repl_ctx = {
  higher: ['foo', 'bar'], // globals
  current: [],
  toplevel: true
};



let input1 = `let quul = (foo) => {
  let bar = 12;
  let baz = 13;
  let forb = when(foo) ? bar : baz(foo);
  return forb;
};`;

let input2 = `let quul = quul(42);`;

let parsed1 = Parse.run(LP.repl_line, input1);

let parsed2 = Parse.run(LP.repl_line, input2);

let ast1 = get('result', parsed1);//?

let errs1 = get('errors', parsed1); //?

let ast2 = get('result', parsed2); //?

let errs2 = get('errors', parsed2);

let ctx_includes_id = (ctx, id) => includes(id, concat(get('higher', ctx), get('current', ctx)));

let check_name = fn('check_name', [
  (ctx) => partial(check_name, ctx),
  (ctx, name) => {
    let {higher, current, toplevel} = ctx;
    let forbidden_err = when(includes(name, forbidden))
      ? raise(`Cannot use reserved word ${name} as identifier.`)
      : undefined;
    let shadow_warn = when(includes(name, higher))
      ? warn(`Shadowed name ${name}.`)
      : undefined;
    let redefinition_err = when(and(not(toplevel), includes(name, current)))
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

  array: (ctx, array) => every(check_ids(ctx), array),

  object: (ctx, object) => every(check_ids(ctx), object),

  pair: (ctx, [_, expr]) => check_ids(ctx, expr),

  splat: (ctx, splat) => check_ids(ctx, splat),

  when: (ctx, when) => every(check_ids(ctx), values(when)),

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
check_ids(repl_ctx, ast2); //?
