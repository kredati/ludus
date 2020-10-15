//////////////////// Predicates (signed)
// Signed predicates: new predicates, as well as signed versions of unsigned
// predicates.

import Ludus from './deps.js';

let {defn, partial} = Ludus.Fn;
let P = Ludus.Pred;
let S = Ludus.Spec;

///// Signed versions of old functions

let bool = defn({
  name: 'bool',
  doc: 'Coerces a value to boolean `true` or `false`: returns false if a value is `false` or `undefined`. Otherwise returns true.',
  body: P.bool
});

let is_any = defn({
  name: 'is_any',
  doc: 'Always returns true: could be anything. Otherwise returns false.',
  body: P.is_any
});

let is_undef = defn({
  name: 'is_undef',
  doc: 'Returns true if the passed value is undefined. Otherwise returns false.',
  body: P.is_undef
});

let is_some = defn({
  name: 'is_some',
  doc: 'Returns true if the passed value is *not* undefined. Otherwise returns false.',
  body: P.is_some
});

let is_string = defn({
  name: 'is_string',
  doc: 'Returns true if the passed value is a string. Otherwise returns false.',
  body: P.is_string
});

let is_number = defn({
  name: 'is_number',
  doc: 'Returns true if the passed value is a number. Otherwise returns false.',
  body: P.is_number
});

let is_int = defn({
  name: 'is_int',
  doc: 'Returns true if the value passed is an integer. Otherwise returns false.',
  body: P.is_int
});

let is_bigint = defn({
  name: 'is_bigint',
  doc: 'Returns true if the passed value is a bigint. Otherwise returns false.',
  body: P.is_bigint
});

let is_bool = defn({
  name: 'is_bool',
  doc: 'Returns true if the value passed is a boolean. Otherwise returns false.',
  body: P.is_bool
});

let is_symbol = defn({
  name: 'is_symbol',
  doc: 'Returns true if the value passed is a symboP. Otherwise returns false.',
  body: P.is_symbol
});

let is_fn = defn({
  name: 'is_fn',
  doc: 'Returns true if the value passed is a function. Otherwise returns false.',
  body: P.is_fn
});

let is_obj = defn({
  name: 'is_obj',
  doc: 'Returns true if the value passed is an object. Otherwise returns false. NB: All collections are objects: object literals, but also arrays, vectors, lists, etc.',
  body: P.is_obj
});

let is_assoc = defn({
  name: 'is_assoc',
  doc: '// tells if a value is an "associative data structure" in Ludus. For the most part, this means Object literals. It excludes any JS objects that are constructed using `new`, but it does not exclude objects that are created using `Object.create`. Ludus objects are all `create`d, but also always set a constructor property on the prototype, so this should exclude any Ludus objects.',
  body: P.is_assoc
});

let is_iter = defn({
  name: 'is_iter',
  doc: 'Returns true if the value passed in conforms to the JS iterable protocoP. Otherwise returns false. It does not do this check relentlessly: it returns true if the value has a `function` at `[Symbol.iterator]`.',
  body: P.is_iter
});

let is_sequence = defn({
  name: 'is_sequence',
  doc: 'Returns true if the value passed in is a sequence: an iterable collection. (Strings are iterable, but they are not sequences.) Otherwise returns false.',
  body: P.is_sequence
});

let is_sequence_of = defn({
  name: 'is_sequence_of',
  doc: 'Takes a predicate and a value and returns true if the value is a sequence and each member of the sequence passes the preidcate. (Strings are iterable but not sequences.) Otherwise returns false.',
  pre: S.args([S.function], [S.function, S.any]),
  body: [
    (pred) => partial(is_sequence_of, pred),
    (pred, xs) => {
      if (!is_sequence(seq)) return false;
      for (let x of xs) {
        if (!bool(pred(x))) return false;
      }
      return true;
    }
  ]
});

let is_array = defn({
  name: 'is_array',
  doc: 'Tells if something is an array.',
  body: P.is_array
});

let not = defn({
  name: 'not',
  doc: 'Takes a function, and returns a function that is the negation of its boolean value.',
  pre: S.args([S.function]),
  body: P.not
});

let and = defn({
  name: 'and',
  doc: 'Takes a single function, or a list of two or more functions. With a list of functions, it returns a function that passes its args to each of the list of functions, and returns `true` only if every result is truthy. With a single function, it returns a function that takes a list of functions, and is the `and` of that function and the passed list.',
  pre: S.seq(S.function),
  body: [
    (x) => partial(and, x),
    (x, y, ...z) => P.and(x, y, ...z) 
  ]
});

let or = defn({
  name: 'or',
  doc: 'Takes one or more functions. Returns a function that passes its args to each of the list of functions, and returns `true` if any result is truthy.',
  pre: S.seq(S.function),
  body: [
    (x) => partial(or, x),
    (x, y, ...z) => P.or(x, y, ...z)
  ]
});

let maybe = defn({
  name: 'maybe',
  doc: 'Takes a predicate function and returns a predicate function that returns true if the value passed passes the predicate function, or if the value is undefined.',
  pre: S.args([S.function]),
  body: (fn) => P.fn(`maybe<${fn.name || 'anon.'}>`, or(is_undef, fn))
});

let is_key = defn({
  name: 'is_key',
  doc: 'Tells if a value is a valid key for a property on an object.',
  body: or(is_number, is_string)
});

let has = defn({
  name: 'has',
  doc: 'Tells if an object has some value set at a particular key. Note that it will return `true` if a particular object has had a key explicitly set to `undefined`. Only tests own properties.',
  pre: S.args([S.key], [S.key, S.any]),
  body: [
    (key) => Ludus.fn(`has<${key}>`, (obj) => has(key, obj)),
    (key, obj) => obj != undefined && obj.hasOwnProperty(key)
  ]
});

let at = defn({
  name: 'at',
  doc: 'Returns a predicate function that tests if particular property of an object passes a predicate. Takes a key and a predicate, and returns a predicate function that will return true if the value passed in has a value that passes the predicate at the specified key. `at` tests properties on anything that may hold properties, including `string`s and `sequence`s.',
  pre: S.args([S.key, S.function]),
  body: (key, pred) => {
    let name = `at<${key}: ${pred.name}>`;
    let body = (obj) => obj != undefined && bool(pred(obj[key]));
    return defn({name, body, explain: at});
  }
});

let dict = defn({
  name: 'dict',
  doc: 'Returns a predicate function that tests if all properties of an object pass a particular predicate. This type of data structure is often called a "dictionary." `dict`s must be associate objects.',
  pre: S.args([S.function]),
  body: (pred) => defn({
    name: `dict<${pred.name || 'anon.'}>`,
    explain: dict,
    body: (obj) => {
      if (!is_assoc(obj)) return false;
      for (let key of Object.keys(obj)) {
        if (!bool(pred(obj[key]))) return false;
      }
      return true;
    }
  })
});

let Pred = Ludus.NS.defns({
  name: 'Pred',
  members: {
    bool, is_any, is_undef, is_some, 
    is_string, is_number, is_int, is_bool, is_symbol,
    is_fn, is_obj, is_assoc, is_iter, is_sequence,
    is_sequence_of, is_array,
    not, and, or, maybe, at, is_key, has, dict, 
  }
});

export default Pred;
