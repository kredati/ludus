import '../prelude/prelude.js';
import Parse from './parse.js';

let {string, label, any_of, and_then, parse_char, opt, many, digit, run,map_parser, char_in_range, satisfy, many1, or_else, between, whitespace, line_break, sep_by, print_result, lowercase, uppercase, but_not} = Parse;

let forward = (name) => {
  let f = ref({name, value: () => {}});
  let out = Fn.rename(name, (...args) => deref(f)(...args));
  return [out, f]
};

let [literal, lit_ref] = forward('literal');

let ws = many(whitespace);

let wsl = many(or_else(whitespace, line_break));

let true_p = string('true');

let false_p = string('false');

let bool_p = label('boolean', or_else(true_p, false_p));

let nonzero_digit = satisfy('nonzero digit', char_in_range('1', '9'));

let zero = label('zero', parse_char('0'));

let sign = parse_char('-')

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

let single_q = between(
  parse_char("'"),
  parse_char("'"),
  many(satisfy('anything but single quote', but_not(any_of("'", '\n', '\r')))),
);

print_result(but_not(any_of("'", "\n")))

print_result(single_q, "'12343'"); //?

let str_p;

let comma_separator = and_then([
  opt(wsl),
  parse_char(','),
  opt(wsl)]);

let arr_p = label('array', 
  between(
    and_then(parse_char('['), opt(wsl)), 
    and_then(opt(wsl), parse_char(']')),
    sep_by(comma_separator, literal)));

let underscore = parse_char('_');

let dollar = parse_char('$');

let id_init = or_else([lowercase, underscore, dollar]);

let id_rest = or_else([lowercase, uppercase, underscore, dollar, digit]);

let identifier = label('identifier', map_parser(flatten, and_then(id_init, many(id_rest))));

let colon_assignment = and_then([
  opt(wsl),
  parse_char(':'),
  opt(wsl)
]);

let key_value = label('key_value', and_then([
  identifier, colon_assignment, literal
]));

let obj_p = label('object',
  between(
    and_then(parse_char('{'), opt(wsl)),
    and_then(opt(wsl), parse_char('}')),
    sep_by(comma_separator, key_value)
  ));

swap(lit_ref, label('literal', or_else([
  bool_p, num_p, arr_p, obj_p
])));

print_result(single_q, "[123"); //?