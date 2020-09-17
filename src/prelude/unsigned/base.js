/////////////////// Base, or the very base of Ludus.
// This moves through several phases:
// 1. The environment
// 2. The object & type model
// 3. Namespaces
// 4. Bolting Ludus types onto builtins
// 5. Exporting the things

//////////////////// The environment, or figuring out who's running us
/*
  We need to figure out who's running us: Node, Deno, or a browser
  Eventually we'll have some more stuff in here, especially IO
  TODO: add IO operations
    [ ] read file
    [ ] read from stdin
    [ ] devise browser equivalents (CodeMirror, for much later)
*/

///// 1. Detecting our runtime

let Ludus = {
  print: (...msgs) => { msgs.forEach(x => console.log(x)); },
  report: (...msgs) => { msgs.forEach(msg => console.error(msg)); },
  warn: (...msgs) => { msgs.forEach(msg => console.warn(msg)); }
};

// if we are running in Deno
if (typeof Deno !== 'undefined') {
  Ludus.runtime = 'deno';
  Ludus.custom = Deno.customInspect;
}

// if we are running in Node
else if (typeof process !== 'undefined') {
  Ludus.runtime = 'node';
  Ludus.custom = Symbol.for('nodejs.util.inspect.custom');
}

// if we are running in a broswer
else if (typeof window !== 'undefined') {
  Ludus.runtime = 'browser';
  Ludus.custom = Symbol.for('ludus/custom');
}

//////////////////// 2. Ludus object & type model
/*
  Ludus expects everything (excepting `undefined`) to have a type, but with a type system we can control--Ludus types do not, in fact, map neatly on to JS types. The way we accomplish this is to give everything metadata, and to use JS's prototypical inheritance to control that metadata, which normally consist of: type data; a namespace; and extended methods. More on each below.
*/

// An absolutely bare bones object as the base of our Ludus objects
// We use a null prototype so there's *nothing* on this object
let ludus_proto = Object.create(null);

///// Base methods
// JS needs for the the iterator to be an nullary function
// To fake this, we dispatch to the `iterate` function in the object's namespace. If the iterator is not defined in that namespace, you'll get a ReferenceError. (More on this below.)
ludus_proto[Symbol.iterator] = function () {
  return this[Symbol.for('ludus/meta')]?.ns?.iterate(this);
};

// Likewise, JS expects repl-display objects to have a nullary method
// This dispatches to `show` in the object's namespace. If `show` isn't defined, just return the object and let the repl environment deal with it.
ludus_proto[Ludus.custom] = function () {
  return this[Symbol.for('ludus/meta')]?.ns?.show(this) ?? this;
};

// A symbol tag for metadata; global just in case.
let meta_tag = Symbol.for('ludus/meta');

// A cute function to retrieve metadata
// Undefined has no metadata
let meta = (x) => x == undefined ? undefined : x[Symbol.for('ludus/meta')];

///// Types
// Types are the prototypes for the metadata on any given object. Types hold hold four properties: a `name`; `type`, which is a circular reference; `ns`, which is a namespace associated with that type; and `methods`, which holds any methods that get added outside the core namespace.

// A Type type
let Type = Object.create(ludus_proto);
Type.name = 'Type';
Type[Symbol.for('ludus/meta')] = {
  // Note that there's no namespace to start, so we defer with a getter
  // Namespaces are added to types only optionally, and add themselves to the type
  get ns() { return Type.ns; }
};
Type[Symbol.for('ludus/meta')].type = Type;

// create :: (Type, obj) -> Type
// Create is the way we create objects that aren't simply object literals (maps)
let create = (type, attrs = {}) => {
  let created = Object.assign(Object.create(ludus_proto), attrs);
  let meta = Object.create(type); // metadata is added
  let passed_meta = attrs[Symbol.for('ludus/meta')] ?? {};
  for (let key in passed_meta) {
    // TODO: figure out why I can't use normal assignment here
    Object.defineProperty(meta, key, {value: passed_meta[key]});
  }
  created[Symbol.for('ludus/meta')] = meta;
  return created;
};

let deftype = (attrs) => {
  let type = create(Type, attrs);
  type.type = type;
  type.methods = {};
  return type;
};

let Undefined = deftype({name: 'Undefined'});

let show_type = (type) => `{ ${type.name} }`;

let type_of = (x) => x === undefined 
  ? Undefined
  : x[Symbol.for('ludus/meta')].type;

let is = (type, x) => type_of(x) === type;

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

let defns = ({name, type, members, ...attrs}) => {
  let ns = create(Namespace, {
    [members_tag]: {...members},
    [meta_tag]: type === undefined 
      ? {name, ...attrs} 
      : {name, type, ...attrs}
  });
  let proxied = new Proxy(ns, ns_handler);
  if (type !== undefined) type.ns = proxied;
  return proxied;
};

let is_ns = (x) => T.is(Namespace, x);

let NS = defns({name: 'Namespace', type: Namespace,
  members: {is_ns, defns, defmembers, def, show: show_ns}});

let Type_ns = defns({name: 'Type', type: Type, 
  members: {show: show_type, deftype, type_of, is, meta, create}});

let Num = deftype({name: 'Number'});
Number.prototype[meta_tag] = Num;

let num_ns = defns({name: 'Math', type: Num, members: {quuz: 42}});

defmembers(num_ns, {foo: 42, bar: 23});

let List = deftype({name: 'List', doc: 'A linked list.'});

let is_list = (list) => type_of(list) === List;

let empty = create(List, {size: 0});

let is_empty = (list) => list === empty;

let cons = (first, rest = empty) => create(List, {first, rest, size: rest.size + 1});

let conj = (list, value) => cons(value, list);

let first = (list) => list.first;

let rest = (list) => list.rest;

let list = (...xs) => xs.reduceRight(conj, empty);

let show_list = (list) => list === empty 
  ? '()'
  : `(${[...list].join(', ')})`;

let iterate = (list) => {
  return {
    next() {
      if (is_empty(list)) return {done: true};
      let value = list.first;
      list = list.rest;
      return {value};
    }
  }
};

let l = defns({name: 'List', type: List, members: {
  list, show: show_list, cons, conj, first, rest, empty, is_empty, iterate
}});

let foo = list(1, 2, 3); //?
is_list(foo) //?

let dispatch = (method, value, ...args) => {
  let fn = meta(value).methods[method] ?? meta(value).ns[method];
  return fn(...args);
};

let implements = (method, type) => method in type.ns;

let extend = (type, fn) => type.methods[fn.name] = fn;

dispatch('conj', foo, foo, 4); //?

let conj_ = (coll, val) => dispatch('conj', coll, coll, val);

let join = (coll, separator = '') => [...coll].join(separator);

let join_ = (coll, separator = '') => dispatch('join', coll, coll, separator);

extend(List, join);

join_(foo); //?
