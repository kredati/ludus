//////////////////// ns
///// A signed version of the ns ns

import L from './deps.js';
import T from './type.js';

let {Fn, Spec, NS} = L;
let {defn, partial} = Fn;
let {args, str, type, any, obj, at, or, and, defspec} = Spec;

let is_ns = defn({
  name: 'is_ns',
  doc: 'Tells if something is a namespace.',
  body: NS.is_ns
});

let named_or_typed = or(at('name', str), at('type', type(T.t)));
let with_members = at('members', obj);
let ns_descriptor = defspec({name: 'ns_descriptor', pred: and(named_or_typed, with_members)});

let ns = defn({
  name: 'ns',
  doc: 'Defines a namespace. With one argument, takes a namespace descriptor, which must have a either string `name` or a `type`. With two arguments, takes a namespace and an object describing new namespace members, and modifies the namespace by adding or replacing members. Returns the namespace. Note that `ns` is a special form: it may only be used after `export default`.',
  pre: args([ns_descriptor], [type(NS.t), obj]),
  body: [
    (descriptor) => NS.ns(descriptor),
    (type, members) => defmembers(type, members)
  ]
});

let ns_s = defspec({name: 'ns', pred: is_ns});

let defmembers = defn({
  name: 'defmembers',
  doc: 'Takes a namespace and an object, adding the key/value pairs to the namespace. Any values in the members object overwrite the namespace. Be careful with this; you should only use `defmembers` when the namespace is under your control, and if you are certain that changing members will not lead to subtle bugs.',
  pre: args([ns_s, obj]),
  body: NS.defmembers
});

let members = defn({
  name: 'members',
  doc: 'Returns an object containing the members of a namespace.',
  pre: args([ns_s]),
  body: NS.members
});

let def = defn({
  name: 'def',
  doc: 'Defines a member of a namespace. If the member already exists, overwrites it.',
  pre: args([ns_s, str, any]),
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
  pre: args([ns_s]),
  body: NS.show
});

let has = defn({
  name: 'has',
  doc: 'Tells if a namespace has a value associated with a particular name.',
  pre: args([str], [str, ns_s]),
  body: [
    (name) => partial(has, name),
    (name, ns) => name in ns
  ]
});

// We have to create a new NS namespace because otherwise
// we end up with endless recursion
export default ns({
  type: NS.t, 
  members: 
    {is_ns, ns, defmembers, members, def, get_ns, show}
  });
