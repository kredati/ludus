//////////////////// ns
///// A signed version of the ns ns

import L from './deps.js';
import Type from './type.js';

let {Fn, Spec, NS} = L;
let {defn} = Fn;
let {args, string, type, any, obj, at, or, and, defspec} = Spec;

let is_ns = defn({
  name: 'is_ns',
  doc: 'Tells if something is a namespace.',
  body: NS.is_ns
});

let named_or_typed = or(at('name', string), at('type', type(Type.Type)));
let with_members = at('members', obj);
let ns_descriptor = defspec({name: 'ns_descriptor', pred: and(named_or_typed, with_members)});

let defns = defn({
  name: 'defns',
  doc: 'Defines a namespace. Takes a namespace descriptor. Must have a string `name` or a `type`.',
  pre: args([ns_descriptor]),
  body: NS.defns
});

let ns = defspec({name: 'ns', pred: is_ns});

let defmembers = defn({
  name: 'defmembers',
  doc: 'Takes a namespace and an object, adding the key/value pairs to the namespace. Any values in the members object overwrite the namespace. Be careful with this; you should only use `defmembers` when the namespace is under your control, and if you are certain that changing members will not lead to subtle bugs.',
  pre: args([ns, obj]),
  body: NS.defmembers
});

let members = defn({
  name: 'members',
  doc: 'Returns an object containing the members of a namespace.',
  pre: args([ns]),
  body: NS.members
});

let def = defn({
  name: 'def',
  doc: 'Defines a member of a namespace. If the member already exists, overwrites it.',
  pre: args([ns, string, any]),
  body: NS.def
});

let get_ns = defn({
  name: 'get_ns',
  doc: 'Given any value, return the namespace that corresponds to its type. Returns undefined if either a type or a namespace are undefined. (Note: this should only happen with a type that has not been associated with a namespace.)',
  body: NS.get_ns
});

let show = defn({
  name: 'show',
  doc: 'Shows a namespace.',
  pre: args([ns]),
  body: NS.show
});

export default defns({
  type: Type.meta(NS).type,
  members: {is_ns, defns, defmembers, members, def, get_ns, show}
});
