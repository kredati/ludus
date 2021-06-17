//////////////////// Parser combinators
// Functional parser combinators and utils
// Largely cribbed from https://fsharpforfunandprofit.com/parser/
// thank you Scott Wlaschin

// TODO: give better names to the partially applied functions
// TODO: make str_to_state lazy

import '../prelude/prelude.js';

let parser_state = record('parser_state',{
  line: is_int,
  col: is_int,
  lines: iter_of(is_str)
});

let str_to_state = fn({
  name: 'str_to_state',
  pre: args([is_str]),
  body: (str) => ({
    line: 0,
    col: 0,
    lines: Str.split('\n', str)
  })
});

let current_char = fn({
  name: 'current_char',
  pre: args([parser_state]),
  body: ({line, col, lines}) => {
  let current_line = get(line, lines);
  let next_line = get(inc(line), lines);
  let current_char = get(col, current_line);
  return when(current_char) 
    ? current_char 
    : when(and(current_line, next_line)) 
      ? '\n'
      : undefined
  }
});

let next_state = fn({
  name: 'next_state',
  pre: args([parser_state]),
  body: ({line, col, lines}) => {
  let current_line = get(line, lines);
  return when(gt(inc(col), count(current_line)))
    ? {line: inc(line), col: 0, lines}
    : {line, col: inc(col), lines}
  }
});

let parser_input = at('input', parser_state);

let ok = fn({
  name: 'ok', 
  pre: args([is_any, parser_state]),
  body: (result, input) => ({ok: true, result, input})
});

let fail = fn({
  name: 'fail',
  pre: args([iter_of(or(iter_of(is_str), is_str)), parser_state, is_fn]),
  body: (errors, input, from) => ({ok: false, errors, input, from})
});

let satisfy = fn({
  name: 'satisfy',
  pre: args([is_str, is_fn], [is_str, is_fn, parser_input]),
  body: [
  (name, pred) => Fn.rename(name, partial(satisfy, name, pred)),
  (name, pred, {input: xs}) => {
    let next = current_char(xs);
    let success = when(pred(next))
      ? ok(next, next_state(xs))
      : undefined;
    return when(success)
      ? success
      : fail([`Error parsing ${name}`, `Unexpected ${or(next, 'eof')}`], xs, satisfy);
  }
  ]
});

let label = fn({
  name: 'label',
  pre: args([is_str, is_fn], [is_str, is_fn, parser_input]),
  body: [
  (name, parser) => Fn.rename(name, partial(label, name, parser)),
  (name, parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? result
      : assoc(result, 'errors', 
        [`Error parsing ${name}`, ...rest(get('errors', result))]);
  }
  ]
});

let raising = fn({
  name: 'raising',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(get('name', parser), partial(raising, parser)),
  (parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? result
      : raise({message: Str.from(get('errors', result), ". "), result})
  }
  ]
});

let handling = fn({
  name: 'handling',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(get('name', parser), partial(handling, parser)),
  (parser, input) => bound(() => parser(input))() 
  ]
});

let run = fn({
  name: 'run',
  pre: args([is_fn, is_str]),
  body: (parser, input) => parser({input: str_to_state(input)})
});

let parse_char = fn({
  name: 'parse_char',
  pre: args([is_char]),
  body: (char) => satisfy(char, eq(char))
});

let eof = satisfy('end of file', is_undef);

let and_then = fn({
  name: 'and_then',
  pre: args(
    [iter_of(is_fn)], // TODO: enforce minimum length? 
    [is_fn, is_fn], 
    [is_fn, is_fn, parser_input]),
  body: [
  (parsers) => Fn.rename(
    Str.from(map(get('name'), parsers), ' then '), 
    reduce(and_then, parsers)),
  (parser1, parser2) => Fn.rename(
    `${get('name', parser1)} then ${get('name', parser2)}`, 
    partial(and_then, parser1, parser2)),
  (parser1, parser2, input) => {
    let result1 = parser1(input);
    let result2 = when(get('ok', result1))
      ? parser2(result1)
      : undefined;

    let remaining_input = or(get('input', result2), get('input', result1));
    let result_tuple = [get('result', result1), get('result', result2)];


    let parser_errors = or(get('errors', result1), get('errors', result2), []);
    let error_name = get('name', 
      when(get('errors', result1)) ? parser1 : parser2);
    let errors = [
      `Error parsing ${get('name', parser1)} then ${get('name', parser2)}`, 
      `Expected ${error_name}`,
      ...rest(parser_errors)];

    return when(get('ok', result2))
      ? ok(result_tuple, remaining_input)
      : fail(errors, remaining_input, and_then);
  }
  ]
});

let or_else = fn({
  name: 'or_else',
  pre: args([iter_of(is_fn)], [is_fn, is_fn], [is_fn, is_fn, parser_input]),
  body: [
  (parsers) => Fn.rename(Str.from(map(get('name'), parsers), '|'), 
    reduce(or_else, parsers)),
  (parser1, parser2) => Fn.rename(`${get('name', parser1)}|${get('name', parser2)}`, partial(or_else, parser1, parser2)),
  (parser1, parser2, input) => {
    let result1 = parser1(input);
    return when(get('ok', result1))
      ? result1
      : label(`${get('name', parser1)}|${get('name', parser2)}`, parser2)(input);
  }
  ]
});

let is_tup = and(is_arr, pipe(
  count,
  eq(2)
));

let unpack_left = ([fst, snd]) => when(is_tup(fst))
  ? [...unpack_left(fst), snd]
  : [fst, snd];

let unpack_right = ([fst, snd]) => when((is_tup(snd)))
  ? [fst, ...unpack_right(snd)]
  : [fst];

let map_parser = fn({
  name: 'map_parser',
  pre: args([is_fn], [is_fn, is_fn], [is_fn, is_fn, parser_input]),
  body: [
  (f) => partial(map_parser, f),
  (f, parser) => partial(map_parser, f, parser),
  (f, parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? update(result, 'result', f)
      : result
  }
  ]
});

let add_loc = fn({
  name: 'add_loc',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(get('name', parser), partial(add_loc, parser)),
  (parser, input) => {
    let result = parser(input);
    let loc = get('input', input);
    let inner_result = get('result', result);
    let new_result = when(get('ok', result))
      ? ok(assoc(inner_result, 'loc', loc), get('input', result))
      : result;
    return new_result;
  }
  ]
});

let many = fn({
  name: 'many',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(`many<${get('name', parser)}>`, partial(many, parser)),
  (parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? call(() => {
        let next = many(parser, result);
        return ok(
          [get('result', result), get('result', next)], 
          get('input', next));
      })
      : ok([], get('input', input));
  }
  ]
});

let many1 = fn({
  name: 'many1',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(
    `at least one ${get('name', parser)}`, 
    partial(many1, parser)),
  (parser, input) => label(`at least one ${get('name', parser)}`, and_then(parser, many(parser)))(input)
  ]
});

let opt = fn({
  name: 'opt',
  pre: args([is_fn], [is_fn, parser_input]),
  body: [
  (parser) => Fn.rename(`opt<${get('name', parser)}>`, partial(opt, parser)),
  (parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? result
      : ok(undefined, get('input', result));
  }
  ]
});

let keep_first = fn({
  name: 'keep_first',
  pre: args([is_fn, is_fn]),
  body: (fst, snd) => label(
    `${get('name', fst)} then ${get('name', snd)}`,
    map_parser(first, and_then(fst, snd)))
});

let keep_second = fn({
  name: 'keep_second',
  pre: args([is_fn, is_fn]),
  body: (fst, snd) => label(
    `${get('name', fst)} then ${get('name', snd)}`,
    map_parser(second, and_then(fst, snd)))
});

let between = fn({
  name: 'between',
  pre: args([is_fn, is_fn], [is_fn, is_fn, is_fn]),
  body: [
  (open, close) => partial(between, open, close),
  (open, close, body) => label(
    `between<${get('name', open)}, ${get('name', close)}>`,
    keep_second(open, keep_first(body, close)))
  ]
});

let sep_by1 = fn({
  name: 'sep_by',
  pre: args([is_fn, is_fn], [is_fn, is_fn, parser_input]),
  body: (separator, parser) => {
    let sep_then_p = keep_second(separator, parser);
    return label(
      `sep_by<${get('name', separator)}, ${get('name', parser)}>`,
      map_parser(
        unpack_right,
        and_then(parser, many(sep_then_p))));
  }
});

let no_op = fn({
  name: 'no_op',
  pre: args([parser_input]),
  body: ({input}) => ok(undefined, input)
});

let any_of = fn({
  name: 'any_of',
  pre: args([is_char]),
  body: [
  (...cs) => label(
    `any_of<${Str.from(map(get('name'), cs), ', ')}>`,
    or_else(map(parse_char, cs)))
  ]
});

let sep_by = fn({
  name: 'sep_by',
  pre: args([is_fn, is_fn]),
  body: (separator, parser) =>
    label(
      `sep_by<${get('name', separator)}, ${get('name', parser)}>`,
      or_else(sep_by1(separator, parser), no_op))
});

let string = fn({
  name: 'string',
  pre: args([is_str]),
  body: (s) => label(s,
    map_parser(
      pipe(unpack_left, Str.from), 
      and_then(map(parse_char, [...s]))))
});

let string_ = fn({
  name: 'string',
  pre: args([is_str]),
  body: (s) => {
    let parser = map_parser(
      pipe(unpack_left, Str.from), 
      and_then(map(parse_char, [...s])));
    return fn(`'${s}'`, (input) => {
      let result = parser(input);
      return when(get('ok', result))
        ? result
        : fail([`Error parsing '${s}'`, `Expected '${s}'`, Arr.last(get('errors', result))], get('input', input), string_)
    })
  }
});

let char_in_range = fn({
  name: 'char_in_range',
  pre: args([is_char, is_char], [is_char, is_char, Spec.maybe(is_char)]),
  body: [
  (start, end) => partial(char_in_range, start, end),
  (start, end, char) => {
    let start_code = Str.code_at(0, start);
    let end_code = Str.code_at(0, end);
    let char_code = when(char) ? Str.code_at(0, char) : undefined;
    return when(char_code)
      ? and(
        gte(char_code, start_code),
        lte(char_code, end_code))
      : false;
  }
  ]
});

let lowercase = satisfy('lowercase', char_in_range('a', 'z'));

let uppercase = satisfy('uppercase', char_in_range('A', 'Z'));

let digit = satisfy('digit', char_in_range('0', '9'));

let whitespace = label('whitespace', any_of('\t', ' '));

let line_break = label('line_break', any_of('\n', '\r'));

let print_result = fn({
  name: 'print_result',
  pre: args([is_fn, is_str]),
  body: (parser, input) => {
    let result = run(parser, input);
    return when(get('ok', result))
      ? Str.from(get('result', result))
      : get('err', result);
  }
});

export default ns({
  name: 'Parse',
  members: {
    ok, fail, current_char, next_state,
    satisfy, label, run, parse_char, and_then,
    or_else, map_parser, many, many1, opt, keep_first,
    keep_second, between, sep_by1, no_op, any_of,
    sep_by, string: string_, char_in_range, uppercase, lowercase,
    digit, whitespace, line_break, print_result, eof, add_loc,
    raising, handling
  }
});

let input = `adx`;

let get_errors = fn('get_errors', (parser) => get('errors', run(parser, input))); //?

let err = run(handling(and_then(or_else([
  string_('aa'),
  string('ab'),
  string('ac'),
  string('ad')]),
  raising(or_else([
    string('xx'),
    string('xy'),
    string('xz')
  ])))), input); //?

