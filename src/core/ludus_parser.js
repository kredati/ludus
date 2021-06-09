//////////////////// A Ludus parser, in Ludus
// Parser combinators and the stdlib, we can parse Ludus.
// It turns out it's reasonably easy

// TODOs:
// [ ] destructuring assignment in `let`s
// [ ] destructuring assignment in params
// [ ] `as` aliases in imports and exports
// [ ] comments
// [ ] factor out lists, brackets
// [ ] move forward references elsewhere (Fn? Parse?)
// [ ] fix namespace export
// [-] build AST from parsers
// [ ] add template strings
// [ ] add `js` to skip parsing
// [ ] start working on good errors

import '../prelude/prelude.js';
import Parse from './parse.js';

let {string, label, and_then, parse_char, opt, many, digit, run,map_parser, char_in_range, satisfy, many1, or_else, between, whitespace, line_break, sep_by, lowercase, uppercase, sep_by1, keep_first, keep_second} = Parse;

// a handy helper for forward references
// where to put this, and how to enforce it's got to be a fn
let forward = (name) => {
  let f = ref({name, value: () => {}});
  let out = Fn.rename(name, (...args) => deref(f)(...args));
  return [out, f];
};

// forward references for recursive parsers
let [literal, lit_ref] = forward('literal');

let [expression, exp_ref] = forward('expression');

// two helpful whitespace parsers
let ws = many(whitespace);

let wsl = many(or_else(whitespace, line_break));

////////// Atoms

///// undefined
let undef_p = map_parser(
  (_) => undefined,
  string('undefined'));

///// booleans
let true_p = map_parser(
  (_) => true,
  string('true'));

let false_p = map_parser(
  (_) => false,
  string('false'));

let bool_p = label('boolean', or_else(true_p, false_p));

///// numbers
let nonzero_digit = satisfy('nonzero digit', char_in_range('1', '9'));

let zero = label('zero', parse_char('0'));

let sign = parse_char('-');

// integers
let int_p = label('int', 
    and_then([
      opt(sign), 
      nonzero_digit, 
      many(digit)]));

// floating point
let float_p = label('float',
    and_then([
      opt(sign),
      or_else(
        zero,
        and_then(nonzero_digit, many(digit))
      ), 
      parse_char('.'), 
      many1(digit)]));

// Infinity
let infinity_p = and_then(opt(sign), string('Infinity'));

// exponentiated numbers
let exp_p = and_then([
  or_else(int_p, float_p),
  parse_char('e'),
  int_p
]);

let num_p = map_parser(
  pipe(
    partial(flatten, keep(id)),
    Str.from,
    num
  ),
  or_else([float_p, exp_p, infinity_p, int_p]));

///// Strings
// special escape pairs
let escape_pairs = [
  ['\\\'', '\''],   // single quote
  ['\\\"', '\"'],   // double quote
  ['\\\`', '\`'],   // back tick
  ['\\\\', '\\'],   // backslash
  ['\\/', '/'],     // forward slash
  ['\\b', '\b'],    // backspace
  ['\\f', '\f'],    // form feed
  ['\\r', '\r'],    // carriage return
  ['\\n', '\n'],    // newline
  ['\\t', '\t']     // tab
];

// turn this mapping into a parser
let escape_p = or_else(
  into([], 
    map(([to_match, matched]) => map_parser((_) => matched, string(to_match))),
    escape_pairs));

let unescaped_single = satisfy(
  'unescaped char: single quote', 
  not(or(eq('\\'), eq('\''), eq('\n'))));

let single_q = between(
  parse_char("'"),
  parse_char("'"),
  many(or_else(unescaped_single, escape_p)),
);

let unescaped_double = satisfy(
  'unescaped char: double quote',
  not(or(eq('\"'), eq('\\'), eq('\n')))
);

let double_q = between(
  parse_char('"'),
  parse_char('"'),
  many(or_else(unescaped_double, escape_p))
);

let str_p = label('string', 
  map_parser(
    pipe(flatten, Str.from),
    or_else(single_q, double_q)));

let atom = label('atom', map_parser(
  (value) => ({type: 'atom', value}),
  or_else([undef_p, bool_p, num_p, str_p])));

////////// Collections

// handy parsers for collections
let comma_separator = and_then([
  opt(wsl),
  parse_char(','),
  opt(wsl)]);

let spread = string('...');

let trailing_comma = opt(and_then(ws, parse_char(',')))

///// Identifiers & namespaces

// identifiers are valid variable names
let underscore = parse_char('_');

let dollar = parse_char('$');

// identifiers may not begin with capital letters or digits...
let id_init = or_else([lowercase, underscore, dollar]);
//... but they may include them later on
let id_rest = or_else([lowercase, uppercase, underscore, dollar, digit]);

let identifier = label('identifier', 
  map_parser(
    pipe(flatten, Str.from, (name) => ({type: 'identifier', value: name})), 
    and_then(id_init, many(id_rest))));

// namespaces, meanwhile, begin with a capital letter
let ns_name = and_then([
  uppercase,
  many(id_rest)
]);

// and they allow dot-access
let ns_dot_id = and_then([
  many1(and_then(ns_name, parse_char('.'))),
  identifier
]);

///// Arrays
let arr_p = label('array', map_parser(
  (result) => when(result) 
    ? {type: 'array', value: [...result]} 
    : {type: 'array', value: []},
  between(
    and_then(parse_char('['), wsl), 
    and_then(wsl, parse_char(']')),
    keep_first(
      sep_by(comma_separator, expression),
      trailing_comma)
    )));

////////// Objects
// a few helpful constituents
let colon_assignment = and_then([
  wsl, parse_char(':'), wsl
]);

let key_value = label('key_value', map_parser(
  ([key, value]) => ({type: 'pair', value: [key, value]}),
  and_then([
    keep_first(or_else(identifier, map_parser(
        (value) => ({type: 'atom', value}), str_p)), 
      colon_assignment), 
    expression
])));

let splat = label('splat', map_parser(
  (value) => ({type: 'splat', value}),
  keep_second(spread, identifier)));

let obj_p = label('object', map_parser(
  (value) => ({type: 'object', value}),
  between(
    and_then(parse_char('{'), opt(wsl)),
    and_then(opt(wsl), parse_char('}')),
    keep_first(
      sep_by(comma_separator, or_else([key_value, identifier, splat])),
      trailing_comma)
  )));

////////// Finally, a literal parser
// We talk about "function literals," but we defer them
// to their own section
swap(lit_ref, label('literal', or_else([
  atom, arr_p, obj_p
])));

////////// Parens around expressions
// We will need this for function invocation:
// any expression wrapped in parens will just evaluate
// to itself.
let paren_exp = between(
  and_then(parse_char('('), wsl),
  and_then(wsl, parse_char(')')),
  expression
);

////////// Functions

///// Function definition
// a cute little arrow
let arrow = and_then([ws, string('=>'), wsl]);

// this will get more complex
// TODO: 
// [ ] array destructuring
// [ ] object destructuring
// [ ] rest arguments 
let arg_assignment = identifier;

// function parameters
let fn_params = label('params', map_parser(
  (value) => when(value) 
    ? {type: 'params', value}
    : {type: 'params', value: []},
  between(
    parse_char('('),
    parse_char(')'),
    keep_first(
      sep_by(comma_separator, arg_assignment),
      trailing_comma))));

// forward reference for a block, which requires statements
let [block, block_ref] = forward('block');

let fn_body = label('fn body', map_parser(
  (value) => ({type: 'fn_body', value}),
  or_else(block, expression)));

let fn_def = label('function definition',
  map_parser(
    ([params, body]) => ({type: 'function', value: {params, body}}),
    and_then(keep_first(fn_params, arrow), fn_body)));

///// Function invocation
let callable = or_else([
  identifier,
  ns_dot_id,
  paren_exp
]);

let when_undef = (x, default_value) => when(is_undef(x)) ? default_value : x;

let fn_call = label('function call', map_parser(
  ([called, args]) => ({type: 'call', 
    value: {called, args: when_undef(args, [])}}),
  and_then(
    keep_first(callable, ws),
    between(
      and_then(parse_char('('), wsl),
      and_then(wsl, parse_char(')')),
      sep_by(comma_separator, expression)))));

////////// Special forms

///// when
// when is Ludus's conditional form
// it must be followed by a ternary expression
// ternary expressions can only follow when
let when_exp = label('when expression', map_parser(
  ([[condition, if_true], if_false]) => ({
    type: 'when',
    value: {condition, if_true, if_false}
  }),
  and_then([
    keep_second(
      and_then(string('when'), ws), 
      paren_exp), // condition expression
    keep_second(
      and_then([wsl, parse_char('?'), wsl]), 
      expression), // if true
    keep_second(
      and_then([wsl, parse_char(':'), wsl]), 
      expression) // if false
])));

let js;

swap(exp_ref, label('expression', map_parser(
  (value) => ({type: 'expression', value}),
  or_else([
    paren_exp, literal, when_exp, fn_call, identifier, ns_dot_id, fn_def
]))));

////////// Statements

// out statement terminator
let sem = and_then(ws, parse_char(';'));

///// Expression statement
// an expression, plus a semicolon: 'foo';
let expr_stm = label('expr stm', map_parser(
  (value) => ({type: 'statement', value}),
  between(wsl, sem, expression)
));

// let statement
// let foo = bar;
let let_stm = label('let stm', map_parser(
  ([identifier, expression]) => 
    ({type: 'let', value: {identifier, expression}}),
  and_then([
    keep_second(
      and_then([wsl, string('let'), many1(whitespace)]),
      identifier),
    keep_second(
      and_then([ws, parse_char('='), wsl]),
      keep_first(expression, sem))
])));

// return statement
// return add(1, 2);
let return_stm = label('return', map_parser(
  (value) => ({type: 'return', value}),
  keep_second(
    and_then([wsl, string('return'), many1(whitespace)]),
  keep_first(expression, sem))));

// now we have enough to describe a function block
// zero or more let or expression statements,
// followed by a single return statement
swap(block_ref, label('function block', map_parser(
  (value) => ({type: 'block', value: [...flatten(value)]}),
  between(
    and_then(parse_char('{'), wsl),
    and_then(wsl, parse_char('}')),
    and_then( // enforce ordering of let/expression, then return, statements
      many(or_else(let_stm, expr_stm)),
      opt(return_stm)
    )))
));

////////// Imports and exports
// TODO: finish cleaning these up
// TODO: finish AST-ifying these
let bare_import = label('bare import', map_parser(
  (imported) => ({type: 'bare_import', value: {imported}}),
  keep_second(
    and_then([wsl, string('import'), many1(whitespace)]),
    keep_first(str_p, sem))
));

let ns_import = label('ns import', map_parser(
  ([ns_name, imported]) => 
    ({type: 'ns_import', 
      value: {
        imported, 
        ns_name: thread(ns_name, flatten, Str.from)}}),
  and_then(
    keep_second(
      and_then([wsl, string('import'), many1(whitespace)]),
      ns_name),
    keep_second(
      and_then([many1(whitespace), string('from'), many1(whitespace)]),
      keep_first(str_p, sem)))));

let imports = and_then([
  wsl, string('import'), many1(whitespace),
  between(
    and_then(parse_char('{'), wsl),
    and_then(wsl, parse_char('}')),
    sep_by1(comma_separator, identifier)
  ),
  many1(whitespace), string('from'), many1(whitespace),
  str_p, sem
]);

let import_stm = or_else([
  imports, bare_import, ns_import
]);

let ns_export = and_then([
  wsl,
  string('export'),
  many1(whitespace),
  string('default'),
  many1(whitespace),
  string('ns'),
  many(whitespace),
  between(
    and_then(parse_char('('), wsl),
    and_then(wsl, parse_char(')')),
    sep_by1(comma_separator, expression)
  ),
  ws,
  sem
]);

let exports = and_then([
  wsl,
  string('export'),
  many1(whitespace),
  between(
    and_then(parse_char('{'), wsl),
    and_then(parse_char('}'), wsl),
    sep_by1(comma_separator, identifier)
  ),
  ws,
  sem
]);

let export_stm = or_else(ns_export, exports);

let ludus_file = and_then([
  many(import_stm), // TODO: enforce a Ludus import at the beginning?
  many(or_else(let_stm, expr_stm)),
  opt(export_stm)
]);

let repl_line = or_else([
  import_stm,
  let_stm,
  expr_stm
]);