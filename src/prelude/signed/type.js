//////////////////// Types
// A signed version of the type Namespace.

import L from './deps.js';

let {Type, Fn, NS, Pred, Spec} = L;
let {defn, partial} = Fn;
let {args, at} = Spec;
let {is_str, is_any, is_obj, is: is_} = Pred;

let meta = defn({
  name: 'meta',
  doc: 'Gets the metadata associated with a particular value. Returns undefined if there is no metadata. Only functions and objects have metadata.',
  body: Type.meta
});

let show = defn({
  name: 'show',
  doc: 'Shows a type.',
  pre: args([is_(Type.t)]),
  body: Type.show
});

let type = defn({
  name: 'type',
  doc: 'Creates a new type.',
  pre: args([at('name', is_str)]),
  body: Type.type
});

let type_of = defn({
  name: 'type_of',
  doc: 'Gets the type of any value.',
  body: Type.type_of
});

let is = defn({
  name: 'is',
  doc: 'Tells if something is of a given type. With one argument, returns a predicate function. With two arguments, acts as a predicate function.',
  pre: args([is_(Type.t)], [is_(Type.t), is_any]),
  body: [
    (type) => partial(is, type),
    (type, x) => type_of(x) === type
  ]
});

let create = defn({
  name: 'create',
  doc: 'Creates an object of a specified type. Copies all the attributes from the optional second argument onto the created object.',
  pre: args([is_(Type.t)], [is_(Type.t), is_obj]),
  body: [
    (type) => Type.create(type),
    (type, attrs) => Type.create(type, attrs)
  ]
});

let types = Type.types;

// We have to create a new Type namespace because if we modify it, it leads
// to endless recursion
export default NS.ns({
  type: Type.t,
  members: {
    meta, show, type, type_of, is, create, types, ...types
  }
});