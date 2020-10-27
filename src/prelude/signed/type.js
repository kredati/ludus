//////////////////// Types
// A signed version of the type Namespace.

import L from './deps.js';

let {Type, Fn, NS, Spec} = L;
let {defn, partial} = Fn;
let {args, type, string, any, assoc, at} = Spec;

let meta = defn({
  name: 'meta',
  doc: 'Gets the metadata associated with a particular value. Returns undefined if there is no metadata. Only functions and objects have metadata.',
  body: Type.meta
});

let show = defn({
  name: 'show',
  doc: 'Shows a type.',
  pre: args([type(Type.Type)]),
  body: Type.show
});

let deftype = defn({
  name: 'deftype',
  doc: 'Defines a type.',
  pre: args([at('name', string)]),
  body: Type.deftype
});

let type_of = defn({
  name: 'type_of',
  doc: 'Gets the type of any value.',
  body: Type.type_of
});

let is = defn({
  name: 'is',
  doc: 'Tells if something is of a given type. With one argument, returns a predicate function. With two arguments, acts as a predicate function.',
  pre: args([type(Type.Type)], [type(Type.Type), any]),
  body: [
    (type) => partial(is, type),
    (type, x) => type_of(x) === type
  ]
});

let create = defn({
  name: 'create',
  doc: 'Creates an object of a specified type. Copies all the attributes from the optional second argument onto the created object.',
  pre: args([type(Type.Type)], [type(Type.Type), assoc]),
  body: [
    (type) => Type.create(type),
    (type, attrs) => Type.create(type, attrs)
  ]
});

let types = Type.types;

export default NS.defns({
  type: Type.Type,
  members: {meta, show, deftype, type_of, is, create, Type: Type.Type,
    ...types, types, t: types}
});
