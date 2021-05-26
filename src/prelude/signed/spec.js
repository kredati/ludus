//////////////////// Spec
///// A signed version of spec

import L from './deps.js';
import NS from './ns.js';

let {Spec, Fn} = L;
let {defn, partial} = Fn;
let {ns} = NS;

let spec = Spec.or(Spec.type(Spec.t), Spec.fn);

let spec_descriptor = Spec.record('spec_descriptor', {
  name: Spec.str,
  pred: spec
});

let defspec = defn({
  name: 'defspec',
  doc: 'Defines a spec. Takes a spec descriptor: a string name and a predicate, which is either a spec or a function that is treated as a predicate.',
  pre: Spec.args([spec_descriptor]),
  body: Spec.defspec
});

let is_spec = defn({
  name: 'is_spec',
  doc: 'Tells if something is a spec.',
  body: (x) => Type.is(Spec.t, x)
});

let show = defn({
  name: 'show',
  doc: 'Shows a spec.',
  pre: Spec.args([spec]),
  body: Spec.show
});


let is_valid = defn({
  name: 'is_valid',
  doc: 'Validates a value with a spec: takes a spec and a value and returns true if the value conforms to the spec. With a single argument, returns a function that validates the passed value.',
  pre: Spec.args([spec], [spec, Spec.any]),
  body: [
    (spec) => partial(is_valid, spec),
    (spec, value) => Spec.is_valid(spec, value)
  ]
});

let and = defn({
  name: 'and',
  doc: 'Combines specs with boolean and.',
  pre: Spec.args([spec]),
  body: Spec.and
});

let or = defn({
  name: 'or',
  doc: 'Combines specs with boolean or.',
  pre: Spec.args([spec]),
  body: Spec.or
});

let tup = defn({
  name: 'tup',
  doc: 'Creates a tuple: a spec that validates arrays by applying specs at particular positions to corresponding elements in the tuple. E.g. `is_valid(tup(string, number), [\'foo\', 42]) //=> true`, but `is_valid(tup(string, number), [23, 42]) //=> false`.',
  pre: Spec.args([spec]),
  body: Spec.tup
});

let seq = defn({
  name: 'seq',
  doc: 'Creates a spec that validates every element of an iterable with the passed spec.',
  pre: Spec.args([spec]),
  body: Spec.seq
});

let at = defn({
  name: 'at',
  doc: 'Creates a spec that validates a value by applying the spec to the field contained on that value.',
  pre: Spec.args([Spec.str, spec]),
  body: Spec.at
});

let record = defn({
  name: 'Creates a `record`: a named collection of specs. Takes a string name and a "map," which contains specs in various fields. Validates all specs by applying them to the corresponding field on the validated value. Essentially, the `and` of each `at` in the map.',
  pre: Spec.args([Spec.str, Spec.dict(spec)]),
  body: Spec.record
});

let rename = defn({
  name: 'Renames a spec. Useful for giving descriptive names to otherwise complex specs.',
  pre: Spec.args([Spec.str, Spec.type(Spec.t)]),
  body: Spec.rename
});

let dict = defn({
  name: 'dict', 
  doc: 'Creates a spec of a "dictionary": it validates all fields on an value according to the passed spec.',
  pre: Spec.args([spec]),
  body: Spec.dict
});

let maybe = defn({
  name: 'maybe',
  doc: 'Creates a "maybe" spec: it will validate both the passed spec or undefined. Essentially the `or` of the passed spec and `undef`.',
  pre: Spec.args([spec]),
  body: Spec.maybe
});

let args = defn({
  name: 'args',
  doc: 'A function to validate function arguments. Takes one or more arrays that are essentially tuples, validating arrays that match any of these tuples. Will not allow multiple tuples of the same length. Also, to allow for "rest" arguments, if the array to validate is longer than the longest tuple, it applies the last spec to all arguments after the length of the tuple.', // TODO: fix this docstring to make it suck less
  pre: Spec.args([Spec.seq(spec)]),
  body: Spec.args
});

let explain = defn({
  name: 'explain',
  doc: 'Provides a hopefully-informative explanation of why a value did not conform to a spec.',
  pre: Spec.args([spec, Spec.any, maybe(Spec.num)]),
  body: Spec.explain
});

export default ns({
  type: Spec.t, 
  members: {
    ...NS.members(Spec), and, args, at, defspec, dict, explain,
    is_spec, is_valid, maybe, or, record, rename,
    seq, show, tup
}});
