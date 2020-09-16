//////////////////// Types
// A very Ludus typesystem: simple *and* easy
// Also, it almost plays nice with JS: it uses prototypes
// to allow for single-dispatch polymorphism in an easy way
// And *also* provides types that allow multimethods to use
// multiple-dispatch polymorphism. We're all good!

// First, a type for types: Type
let Type = Object.create(null);
Type.name = 'Type';
Type[Symbol.for('ludus/meta')] = {};
Type[Symbol.for('ludus/meta')].type = Type;

let ludus_proto = {
  [Symbol.iterator] () {
    return this[Symbol.for('ludus/meta')]?.ns?.iterate(this);
  },
  // TODO: generalize this with env stuff
  // TODO: improve the fallback from simply returning the object?
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this[Symbol.for('ludus/meta')]?.ns?.show(this) ?? this;
  }
};

// TODO: make this isomorphic with regular object creation
//  ^ to wit, make the meta object the created object.
// deftype :: (obj) -> Type
// Deftype creates a new type. 
let deftype = (attrs) => {
  let proto = Object.create(Type);
  for (let key in attrs) {
    Object.defineProperty(proto, key, {value: attrs[key]});
  }
  Object.defineProperty(proto, 'type', {value: proto});
  return proto;
};


// TODO: figure out if I want attrs as normal fields or not
let create = (type, attrs = {}) => {
  let created = Object.assign(Object.create(ludus_proto), attrs);
  let meta = Object.create(type);
  let passed_meta = attrs[Symbol.for('ludus/meta')] ?? {};
  for (let key in passed_meta) {
    // TODO: figure out why I can't use normal assignment here
    Object.defineProperty(meta, key, {value: passed_meta[key]});
  }
  created[Symbol.for('ludus/meta')] = meta;
  return created;
};

let Undefined = deftype({name: 'Undefined'});

let show_type = (type) => type.name;

let type_of = (x) => x === undefined 
  ? Undefined
  : x[Symbol.for('ludus/meta')].type;

let meta = (x) => x === undefined ? undefined : x[Symbol.for('ludus/meta')];

let is = (t, x) => type_of(x) === t;

//////////////////// Namespaces
// A namespace represents a collection of functions and values.
// Namespaces are, effectively, JS objects, but with a single modification:
// they throw an error when something or someone tries to access a property
// they don't have.
// The Ludus interpreter/compiler will allow dot-property access *only* for
// namespace objects.
// exports a single function: `ns`, which constructs a namespace

class NamespaceError extends Error {};

let members_tag = Symbol.for('ludus/members');
let meta_tag = Symbol.for('ludus/meta');

// ns_handler
// a proxy object for namespaces
// manipulates access to namespaces
let ns_handler = {
  has (target, key) {
    return key in target || key in target[members_tag];
  },
  get (target, key) {
    if (typeof key === 'symbol') return target[key];
    if (key in target[members_tag]) return target[members_tag][key];
    if (key === 'inspect') return show_ns(target);

    throw ReferenceError(`${key.toString()} is not defined in namespace ${target[meta_tag].name}.`);
  },
  set () {
    throw NamespaceError('You may only add to namespaces by using `def`.')
  },
};

let Namespace = deftype({name: 'Namespace'});

let show_ns = (ns) => `Namespace { ${ns[meta_tag].name} }`;

let def = (ns, key, value) => { 
  ns[members_tag][key] = value; 
  return value;
};

let defmembers = (ns, members) => {
  for (let member in members) {
    def(ns, member, members[member]);
  }
};

let ns = ({name, type, members, ...attrs}) => {
  let ns = create(Namespace, {
    [members_tag]: {...members},
    [meta_tag]: type === undefined 
      ? {name, ...attrs} 
      : {name, type, ...attrs}
  }); //?
  let proxied = new Proxy(ns, ns_handler);
  if (type !== undefined) type.ns = proxied;
  return proxied;
};

let is_ns = (x) => T.is(Namespace, x);

let NS_ns = ns({name: 'Namespace', type: Namespace,
  members: {is_ns, ns, defmembers, def, show: show_ns}});

let Type_ns = ns({name: 'Type', type: Type, 
  members: {show: show_type, deftype, type_of, is, meta, create}});

meta(Type) //?

let Num = deftype({name: 'Number'});
Number.prototype[meta_tag] = {};
Number.prototype[meta_tag].type = Num;

let num_ns = ns({name: 'Math', type: Num, members: {quuz: 42}});

meta(Num) //?

meta(Number.prototype).ns = num_ns;

Type_ns.show(meta(4).type); //?

Number.prototype[meta_tag].ns //?
Num[Symbol.for('nodejs.util.inspect.custom')]() //?

defmembers(num_ns, {foo: 42, bar: 23});


let List = deftype({name: 'List'});

let empty = create(List, {size: 0});

let is_empty = (list) => list.size === 0;

let cons = (first, rest = empty) => create(List, {first, rest, size: rest.size + 1});

let conj = (list, value) => cons(value, list);

let first = (list) => list.first;

let rest = (list) => list.rest;

let list = (...xs) => xs.reduceRight(conj, empty);

let show_list = (list) => list === empty 
  ? '()'
  : `(${[...list].join(', ')})`;

let iterate = (list) => {
  let rest = list.rest;
  return {
    next() {
      if (is_empty(list)) return {done: true};
      let value = list.first;
      list = list.rest;
      return {value};
    }
  }
};

let l = ns({name: 'List', type: List, members: {
  list, show: show_list, cons, conj, first, rest, empty, is_empty, iterate
}});

meta(l).name; //?

let foo = list(1, 2, 3); //?
meta(foo).type //?

let conj_ = (list, element) => meta(list).ns.conj(list, element);
let cons_ = (element, list) => meta(list).ns.cons(element, list);