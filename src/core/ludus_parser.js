import '../prelude/prelude.js';
import Parse from './parse.js';

let {string, label, any_of, and_then, parse_char, opt, many, digit, run,map_parser, char_in_range, satisfy, many1, or_else, between, whitespace, line_break, sep_by, print_result, lowercase, uppercase, sep_by1} = Parse;

// a handy helper for forward references
let forward = (name) => {
  let f = ref({name, value: () => {}});
  let out = Fn.rename(name, (...args) => deref(f)(...args));
  return [out, f]
};

// forward references for recursive parsers
let [literal, lit_ref] = forward('literal');

let [expression, exp_ref] = forward('expression');

let ws = many(whitespace);

let wsl = many(or_else(whitespace, line_break));

let undef_p = string('undefined');

let true_p = string('true');

let false_p = string('false');

let bool_p = label('boolean', or_else(true_p, false_p));

let nonzero_digit = satisfy('nonzero digit', char_in_range('1', '9'));

let zero = label('zero', parse_char('0'));

let sign = parse_char('-');

let int_p = label('int', 
    and_then([
      opt(sign), 
      nonzero_digit, 
      many(digit)]));

let float_p = label('float',
    and_then([
      opt(sign),
      or_else(
        zero,
        and_then(nonzero_digit, many(digit))
      ), 
      parse_char('.'), 
      many1(digit)]));

let infinity_p = and_then(opt(sign), string('Infinity'));

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

let escape_p = or_else(
  into([], 
    map(([to_match, matched]) => map_parser((_) => matched, string(to_match))),
    escape_pairs));

let unescaped_single = satisfy(
  'unescaped char', 
  not(or(eq('\\'), eq('\''), eq('\n'))));

let single_q = between(
  parse_char("'"),
  parse_char("'"),
  many(or_else(unescaped_single, escape_p)),
);

let unescaped_double = satisfy(
  'unescaped char',
  not(or(eq('\"'), eq('\\'), eq('\n')))
);

let double_q = between(
  parse_char('"'),
  parse_char('"'),
  many(or_else(unescaped_double, escape_p))
);

let str_p = or_else(single_q, double_q); // TODO: add template strings

let comma_separator = and_then([
  opt(wsl),
  parse_char(','),
  opt(wsl)]);

let spread = string('...');

let arr_p = label('array', 
  between(
    and_then(parse_char('['), wsl), 
    and_then(wsl, parse_char(']')),
    sep_by(comma_separator, expression)));

let underscore = parse_char('_');

let dollar = parse_char('$');

let id_init = or_else([lowercase, underscore, dollar]);

let id_rest = or_else([lowercase, uppercase, underscore, dollar, digit]);

let identifier = label('identifier', 
  map_parser(flatten, and_then(id_init, many(id_rest))));

let colon_assignment = and_then([
  wsl, parse_char(':'), wsl
]);

let key_value = label('key_value', and_then([
  or_else(identifier, str_p), colon_assignment, expression
]));

let splat = label('splat', and_then(spread, identifier));

let obj_p = label('object',
  between(
    and_then(parse_char('{'), opt(wsl)),
    and_then(opt(wsl), parse_char('}')),
    sep_by(comma_separator, or_else(key_value, splat))
  ));

swap(lit_ref, label('literal', or_else([
  undef_p, bool_p, num_p, arr_p, obj_p, str_p
])));

let arrow = and_then([wsl, string('=>'), wsl]);

let arg_assignment = identifier;

let fn_params = between(
  parse_char('('),
  parse_char(')'),
  sep_by(comma_separator, arg_assignment)
);

let [block, block_ref] = forward('block');

let sem = parse_char(';');

let fn_body = or_else(block, expression);

let fn_def = and_then([fn_params, arrow, fn_body]);

let ns_name = and_then([
  uppercase,
  many(id_rest)
]);

let ns_dot_id = and_then([
  many1(and_then(ns_name, parse_char('.'))),
  identifier
]);

let paren_exp = between(
  and_then(parse_char('('), ws),
  and_then(ws, parse_char(')')),
  expression
);

let callable = or_else([
  identifier,
  ns_dot_id,
  paren_exp
]);

let fn_call = and_then([
  callable,
  ws,
  between(
    and_then(parse_char('('), wsl),
    and_then(wsl, parse_char(')')),
    sep_by(comma_separator, expression)
  )
]);

let when_exp = and_then([
  string('when'),
  ws,
  paren_exp,
  wsl,
  parse_char('?'),
  wsl,
  expression,
  wsl,
  parse_char(':'),
  wsl,
  expression
]);

swap(exp_ref, label('expression', or_else([
  paren_exp, literal, when_exp, fn_call, identifier, ns_dot_id, fn_def
])));

let let_stm = and_then([
  wsl,
  string('let'),
  many1(whitespace),
  identifier,
  ws,
  parse_char('='),
  wsl,
  expression,
  ws,
  sem
]);

let return_stm = and_then([
  wsl,
  string('return'),
  many1(whitespace),
  expression,
  ws,
  sem
]);

let expr_stm = and_then([
  wsl,
  expression,
  ws,
  sem
]);

let bare_import = and_then([
  wsl,
  string('import'),
  many1(whitespace),
  str_p,
  ws,
  sem
]);

let ns_import = and_then([
  wsl,
  string('import'),
  many1(whitespace),
  ns_name,
  many1(whitespace),
  string('from'),
  many1(whitespace),
  str_p,
  ws,
  sem
]);

let imports = and_then([
  wsl,
  string('import'),
  many1(whitespace),
  between(
    and_then(parse_char('{'), wsl),
    and_then(wsl, parse_char('}')),
    sep_by1(comma_separator, identifier)
  ),
  many1(whitespace),
  string('from'),
  many1(whitespace),
  str_p,
  ws,
  sem
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

swap(block_ref, between(
  and_then(parse_char('{'), wsl),
  and_then(wsl, parse_char('}')),
  and_then( // enforce ordering of let/expression, then return, statements
    many(or_else(let_stm, expr_stm)),
    opt(return_stm)
  )
));

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