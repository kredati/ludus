//////////////////// Parser combinators
// Functional parser combinators and utils
// Largely cribbed from https://fsharpforfunandprofit.com/parser/
// thank you Scott Wlaschin

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
    // for now we use an eager strategy
    // TODO: maybe make this lazy?
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
  (result, remaining) => ({ok: true, input: remaining, result}));

let fail = fn('fail',
  (message, input) => ({ok: false, input, message}));

let satisfy = fn({
  name: 'satisfy',
  pre: args([is_str, is_fn], [is_str, is_fn, at('input', parser_state)]),
  body: [
    (label, pred) => partial(satisfy, label, pred),
    (label, pred, {input: xs}) => {
      let next = current_char(xs);
      let remaining = next_state(xs);
      return cond(next,
        [is_undef,  () => fail(`Error parsing ${label}: unexpected end of input`, xs)],
        [pred,      () => ok(next, remaining)],
        [always,    () => fail(`Error parsing ${label}: unexpected ${next}`, xs)]
      );
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
        : assoc(result, 'message', `Error parsing ${name}`)
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
      return cond(result1,
        [get('ok'), () => {
          let result2 = parser2(result1);
          return when(get('ok', result2))
            ? ok([get('result', result1), get('result', result2)],
            get('input', result2))
            : fail(get('message', result2), get('input', result2))}],
        [always,    () => fail(get('message', result1),
                  get('input', result1))]
      );
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
    (f, parser, input) => update(parser(input), 'result', f)
  ]
});

let many = fn({
  name: 'many',
  body: [
    (parser) => partial(many, parser),
    (parser, input) => {
      let result = parser(input);
      return cond(result
        [get('ok'), () => {
          let next = many(parser, result);
          return ok(conj(get('result', next), get('result', result)), get('input', next))
        }],
        [always,    () =>
          ok([], get('input', input))]
      );
    }
  ]
});

let big_h = parse_char('H');
let smol_h = parse_char('h');
let smol_f = parse_char('f');
let hs = or_else(big_h, smol_h);
let hf = or_else(smol_h, smol_f);

run(hf, 'fello'); //?
