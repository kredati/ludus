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
  warn: (...msgs) => { msgs.forEach(msg => console.warn(msg)); },
  check: globalThis["ludus/check"] === undefined ? true : globalThis["ludus/check"]
};

console.log(`Ludus typechecking is: ${Ludus.check ? "on" : "off"}`);

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

// A symbol tag for metadata; global just in case.
let meta_tag = Symbol.for('ludus/meta');

// meta :: (any) -> object
// A cute function to retrieve metadata
// Undefined has no metadata
let meta = (x) => x == undefined ? undefined : x[Symbol.for('ludus/meta')];

// An absolutely bare bones object as the base of our Ludus objects
// We use a null prototype so there's *nothing* on this object
let ludus_proto = Object.create(null);

Ludus.meta = meta;
Ludus.meta_tag = meta_tag;
Ludus.proto = ludus_proto;

///// Methods
// We need to integrate polymorphism at a very low level.
// Ludus's model for polymorphism are methods: functions with the
// same name in different type-associated namespaces.
// e.g., `show` will produce a repl-friendly string

// get a namespace for something
// this would normally go in the ns portion but we need it up here
let get_ns = (x) => {
  let _meta = meta(x);
  return _meta && _meta.ns;
};

// method :: ({name: string, not_found: fn?}) -> fn
// defines a method: a function that dispatches to the ns associated
// with the type of the first argument.
// takes an optional 
let method = ({name, not_found, ...attrs}) => Object.assign(Object.defineProperty(
  (first, ...rest) => {
    let ns = get_ns(first);
    if (ns && name in ns) return ns[name](first, ...rest);
    if (not_found) return not_found(first, ...rest);
    throw `Method ${name} not found for ${show(first)}.`;
  },
  'name',
  {value: name}),
  {...attrs}
);

let show = method({
  name: 'show',
  not_found: (x) => {
    if (x == undefined) return 'undefined';
    if (Object.getPrototypeOf(x) === null) return `{.}`;
    if (Object.getPrototypeOf(x) === ludus_proto) return `${meta(x).name}{${Object.entries(x).map(([k, v]) => `${k}: ${show(v)}`).join(', ')}}`;
    return x;
  }
});

let iterate = method({
  name: 'iterate',
  not_found: () => undefined
});

///// Base methods
// JS needs for the the iterator to be an nullary function
// To fake this, we dispatch to the `iterate` function in the object's namespace. If the iterator is not defined in that namespace, you'll get a ReferenceError. (More on this below.)
Object.defineProperty(ludus_proto, Symbol.iterator, {get: function iterator () {
  return iterate(this);
}});


// Likewise, JS expects repl-display objects to have a nullary method
// This dispatches to `show` in the object's namespace. If `show` isn't defined, just return the object and let the repl environment deal with it.
ludus_proto[Ludus.custom] = function () {
  return show(this);
};

Object.defineProperty(ludus_proto, 'toString', {value: ludus_proto[Ludus.custom]});

///// Types
// Types are the prototypes for the metadata on any given object. Types hold hold four properties: a `name`; `type`, which is a circular reference; `ns`, which is a namespace associated with that type; and `methods`, which holds any methods that get added outside the core namespace.

// A Type type
let type_t = Object.create(ludus_proto);
type_t.name = 'type';
type_t.type = type_t;
type_t[meta_tag] = Object.create(ludus_proto);
Object.defineProperty(type_t[meta_tag], 'ns', {get: () => type_t.ns});
type_t[meta_tag].type = type_t;

// create :: (type, obj) -> type
// `create` is the way we create objects that aren't simply object literals
// in Ludus.
let create = (
  type, 
  // pull out the metadata from other attributes
  // NB: passing metadata should be a rare case in the early stages of boostrapping Ludus, since symbol tags aren't allowed in Ludus
  attrs = {}
  ) => {
  // we have to pull the metadata out of attrs
  // we can't do this normal ways because otherwise we end up tracing
  // the prototype chain:
  let meta = Object.prototype.hasOwnProperty.call(attrs, meta_tag)
    ? attrs[meta_tag]
    : Object.create(ludus_proto);
  delete attrs[meta_tag];
  // create a bare object
  let created = Object.create(ludus_proto);
  Object.assign(created, attrs);
  meta = Object.assign(Object.create(type), meta);
  created[meta_tag] = meta;
  return created;
};

// type :: (obj) -> type
// Defines a type. The `name` field is required
let type = (attrs) => {
  let type = create(type_t, attrs);
  // a circular reference for type metadata
  type.type = type;
  // a place for methods not defined in a ns
  //type.methods = {}; // this is obsolete, I think
  return type;
};

// show_type :: (type) -> string
// displays a type as { Name }
let show_type = (type) => `t:{${type.name}}`;

// a special type for `undefined`.
let undef_t = type({name: 'undefined'});

// type_of :: (any) -> type
// a simple type_of function
// only `undefined` needs a special case;
// everything else will have 
let type_of = (x) => x == undefined
  ? undef_t
  : meta(x) === undefined
    ? undefined
    : meta(x).type;

// is :: (type, any) -> boolean
// a predicate for knowing whether something is of a particular type
// will eventually switch on arity
let is = (type, x) => type_of(x) === type;

//////////////////// 3. Namespaces
// A namespace represents a collection of functions and values.
// Namespaces are, effectively, JS objects, but with a single modification:
// they throw an error when something or someone tries to access a property
// they don't have.
// The Ludus interpreter/compiler will allow dot-property access *only* for
// namespace objects.
// exports a single function: `ns`, which constructs a namespace

// a tag for a field to hold members of a namespace
let members_tag = Symbol.for('ludus/members');

// ns_handler
// a proxy object for namespaces
// manipulates access to namespaces
let ns_handler = {
  // has returns true if the key is in the namespace...
  // or in its members
  // namespaces themselves *only* have symbol properties
  has (target, key) {
    return key in target || key in target[members_tag];
  },
  // allows for a `has` function for nses by allowing the `in` operator
  // to work
  getOwnPropertyDescriptor (target, property) {
    if (property in target || property in target[members_tag]) {
      // must be configurable--but why?
      return {configurable: true, enumerable: true};
    }
  },
  // gets a key from the namespace
  get (target, key) {
    // symbol keys are passed through to the ns
    if (typeof key === 'symbol') return target[key];
    // all string keys get delegated to the namespace's members
    if (key in target[members_tag]) return target[members_tag][key];

    // what makes namespaces special: a nice ReferenceError when you access
    // something that isn't defined in their members
    throw ReferenceError(`${key.toString()} is not defined in namespace ${target[meta_tag].name}.`);
  }
};

// a namespace type
let ns_t = type({name: 'namespace'});

// show_ns :: (namespace) -> string
// shows a namespace
let show_ns = (ns) => `ns:{${ns[meta_tag].name}}`;

let is_capitalized = (x) => {
  let code = x.charCodeAt(0);
  return code >= 65 && code <= 90;
};

// def :: (namespace, string, any) -> any
// `def` allows for dynamic manipulation of a namespace: add a member
// to a namespace you have a reference to
// This should be used very sparingly in actual Ludus, but helps us
// manage namespaces in the boostrapping prelude phases
let def = (ns, key, value) => {
  if (is_capitalized(key) && !is(ns_t, value)) {
    throw `Only names of namespaces may be capitalized. You attempted to define ${show(value)} at ${key}.`
  }
  if (!is_capitalized(key) && is(ns_t, value)) {
    throw `Names of namespaces must be capitalized. You attempted to give ${show(ns)} the name ${key}.`
  }
  if (typeof value === 'function') {
    Object.defineProperty(value, 'in_ns', {value: ns, configurable: true});
  }
  ns[members_tag][key] = value; 
  return value;
};

// defmembers :: (namespace, object) -> namespace
// `defmembers` allows `def`ing members in bulk by passing an object
// Again, like `def`, this is mostly plumbing and should not be used later on
let defmembers = (ns, members) => {
  for (let member in members) {
    def(ns, member, members[member]);
  }
  return ns;
};

let members = (ns) => ({...ns[members_tag]});

// del :: (namespace, string) -> undef
let del = (ns, key) => {
  delete ns[members_tag][key]
};

// defns :: ({name: string, type: type?, members: obj}) -> namespace
// `defns` defines a namespace
// Takes a name; an optional type to bind the namespace to; an object
// of members; and arbitrary other metadata (e.g. `doc`)
// Creates a special, proxied namespace object
// If it gets a type, it associates the namespace with that type,
// and vice versa.
// For now, Ludus requires types to be defined before namespaces,
// since the expectation is that types get definied at the tops of
// modules, and namespaces only on export, at the bottom.
let ns = ({name, type, members, ...attrs}) => {
  name = name != undefined ? name : type.name;
  let meta = Object.assign(Object.create(ludus_proto), 
    type === undefined ? {name, ...attrs} : {name, ns_type: type, ...attrs});
  let ns = create(ns_t, {
    name,
    [members_tag]: {},
    [meta_tag]: meta
  });
  let proxied = new Proxy(ns, ns_handler);
  if (type !== undefined) {
    type.ns = proxied
    def(proxied, 't', type);
  };
  defmembers(proxied, members);
  return proxied;
};

// is_ns :: (any) -> boolean
// Tells if something is a namespace
let is_ns = (x) => is(ns_t, x);

// get_ns :: (any) -> maybe(ns)
// Gets the namespace associated with a value; returns undefined
// if there is no such namespace (although there should always be)
// one, if we get everything right.

///// Some namespaces to go with our existing types
// namespace namespace
let NS = ns({name: 'Namespace', type: ns_t,
  members: {is_ns, ns, defmembers, members, def, del, get_ns, show: show_ns}});

// type namespace
let Type = ns({name: 'Type', type: type_t, 
  members: {show: show_type, type, type_of, is, meta, create}});

// undefined namespace
//let Undef_ns = defns({name: 'Undefined', type: Undefined,
//  members: {show: show_undef}});

//////////////////// 4. Bolting Ludus onto JS
// Next, we take the builtins that Ludus knows about, and give them
// types and namesapces

// For each builtin type Ludus cares about, we define a type,
// and then a namespace for that type, and then add that type
// onto the builtin prototype object as our Ludus metadata
// That means instances of these builtin types will carry metadata
// just like Ludus-defined types

// note that, as we don't actually add anything to prototypes beyond
// the meta_tags, we won't get custom inspect or iteration behaviors
// on builtins. This is probably for the best.

let bool_t = type({name: 'Boolean'});
let Bool = ns({type: bool_t, members: {}});
Boolean.prototype[meta_tag] = bool_t;

let num_t = type({name: 'Number'});
let Num = ns({type: num_t, members: {}})
Number.prototype[meta_tag] = num_t;

let str_t = type({name: 'String'});
let Str = ns({type: str_t, members: {}});
String.prototype[meta_tag] = str_t;

/* we don't use symbols in Ludus
let sym_t = type({name: 'Symbol'});
let Sym = ns({type: sym_t, members: {}});
Symbol.prototype[meta_tag] = sym_t;
*/

let obj_t = type({name: 'Object'});
let Obj = ns({type: obj_t, members: {}});
Object.prototype[meta_tag] = obj_t;

let arr_t = type({name: 'Array'});
let Arr = ns({type: arr_t, members: {}});
Array.prototype[meta_tag] = arr_t;

let fn_t = type({name: 'Function'});
let Fn = ns({type: fn_t, members: {}});
Function.prototype[meta_tag] = fn_t;

let types = {
  bool: bool_t,
  num: num_t,
  str: str_t,
  obj: obj_t,
  arr: arr_t,
  fn: fn_t,
  undef: undef_t
};

defmembers(Type, {types, ...types});

//////////////////// 5. Exports
export {NS, Type};
export default ns({name: 'Ludus', members: {
  ...Ludus, show, method, iterate, // functions & props
  NS, Type, Bool, Num, Str, Obj, Arr, Fn // namespaces
}});
