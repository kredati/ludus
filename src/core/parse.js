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
  let current_char = get(col, current_line);
  return when(current_char) 
    ? current_char 
    : when(current_line) 
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

let ok = fn('ok', 
  (result, input) => ({ok: true, result, input}));

let fail = fn('fail',
  (message, input) => ({ok: false, message, input}));

let satisfy = fn({
  name: 'satisfy',
  pre: args([is_str, is_fn], [is_str, is_fn, at('input', parser_state)]),
  body: [
  (label, pred) => partial(satisfy, label, pred),
  (label, pred, {input: xs}) => {
    let next = current_char(xs);
    let success = when(pred(next))
      ? ok(next, next_state(xs))
      : undefined;
    return when(success)
      ? success
      : when(next)
        ? fail(`Error parsing ${label}: unexpected ${next}`, xs)
        : fail(`Error parsing ${label}: unexpected end of input`, xs);
  }
  ]
});

let label = fn({
  name: 'label',
  body: [
  (name, parser) => partial(label, name, parser),
  (name, parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? result
      : assoc(result, 'message', `Error parsing ${name}`);
  }
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

let and_then = fn({
  name: 'and_then',
  body: [
  (parsers) => reduce(and_then, parsers),
  (parser1, parser2) => partial(and_then, parser1, parser2),
  (parser1, parser2, input) => {
    let result1 = parser1(input);
    let result2 = when(get('ok', result1))
      ? parser2(result1)
      : undefined;
    let failure_message = or(
      get('message', result1),
      get('message', result2));
    let remaining_input = or(get('input', result2), get('input', result1));
    let result_tuple = [get('result', result1), get('result', result2)];
    return when(get('ok', result2))
      ? ok(result_tuple, remaining_input)
      : fail(failure_message, remaining_input);
  }
  ]
});

let or_else = fn({
  name: 'or_else',
  body: [
  (parsers) => reduce(or_else, parsers),
  (parser1, parser2) => partial(or_else, parser1, parser2),
  (parser1, parser2, input) => {
    let result1 = parser1(input);
    return when(get('ok', result1))
      ? result1
      : parser2(input)
  }
  ]
});

let map_parser = fn({
  name: 'map_parser',
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

let many = fn({
  name: 'many',
  body: [
  (parser) => partial(many, parser),
  (parser, input) => {
    let result = parser(input);
    return when(get('ok', result))
      ? call(() => {
        let next = many(parser, result);
        return ok(
          conj(get('result', next), get('result', result)), 
          get('input', next));
      })
      : ok([], get('input', input));
  }
  ]
});

let many1 = fn({
  name: 'many1',
  body: [
  (parser) => partial(many1, parser),
  (parser, input) => map_parser(
    flatten, 
    and_then(parser, many(parser)), input)
  ]
});

let opt = fn({
  name: 'opt',
  body: [
  (parser) => partial(opt, parser),
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
  body: (fst, snd) => map_parser(first, and_then(fst, snd))
});

let keep_second = fn({
  name: 'keep_second',
  body: (fst, snd) => map_parser(second, and_then(fst, snd))
});

let between = fn({
  name: 'between',
  body: [
  (open, close) => partial(between, open, close),
  (open, close, body) => 
    keep_second(open, keep_first(body, close))]
});

let sep_by1 = fn({
  name: 'sep_by',
  body: (separator, parser) => {
    let sep_then_p = keep_second(separator, parser);
    return map_parser(
      flatten, 
      and_then(parser, many(sep_then_p)));
  }
});

let no_op = fn({
  name: 'no_op',
  body: ({input}) => ok(undefined, input)
});

let any_of = fn({
  name: 'any_of',
  body: [
  (parsers) => reduce(or_else, parsers),
  (parser1, parser2, ...parsers) => 
    any_of([parser1, parser2, ...parsers])
  ]
});

let sep_by = fn({
  name: 'sep_by',
  body: (separator, parser) =>
    or_else(sep_by1(separator, parser), no_op)
});

let string = fn({
  name: 'string',
  pre: args([is_str]),
  body: (s) => map_parser(
    flatten,
    label(s, and_then(map(parse_char, [...s]))))
});

let char_in_range = fn({
  name: 'char_in_range',
  pre: args([is_char]),
  body: [
  (start, end) => partial(char_in_range, start, end),
  (start, end, char) => {
    let start_code = Str.code_at(0, start);
    let end_code = Str.code_at(0, end);
    let char_code = Str.code_at(0, char);
    return and(
      gte(char_code, start_code),
      lte(char_code, end_code));
  }
  ]
});

let lowercase = satisfy('lowercase', char_in_range('a', 'z'));

let uppercase = satisfy('uppercase', char_in_range('A', 'Z'));

let digit = satisfy('digit', char_in_range('0', '9'));

let whitespace = satisfy('whitespace', any_of('\t', '\s'));

let line_break = satisfy('line_break', any_of('\n', '\r'));

export default ns({
  name: 'Parse',
  members: {
    ok, fail, current_char, next_state,
    satisfy, label, run, parse_char, and_then,
    or_else, map_parser, many, many1, opt, keep_first,
    keep_second, between, sep_by1, no_op, any_of,
    sep_by, string, char_in_range, uppercase, lowercase,
    digit, whitespace, line_break
  }
});