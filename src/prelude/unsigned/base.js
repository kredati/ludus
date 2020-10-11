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

///// Base methods
// JS needs for the the iterator to be an nullary function
// To fake this, we dispatch to the `iterate` function in the object's namespace. If the iterator is not defined in that namespace, you'll get a ReferenceError. (More on this below.)
ludus_proto[Symbol.iterator] = function () {
  let iterate = meta(this)?.ns?.iterate ?? (() => {
    throw TypeError(`No iteration methods found for ${(this[Ludus.custom] 
      ?? ((x) => x.toString()))(this)}.`);
  });
  return iterate(this);
};
Object.defineProperty(ludus_proto, Symbol.iterator, {get: function iterator () {
  let ns = meta(this)?.ns;
  if (ns == undefined) return undefined;
  if ('iterate' in ns) return ns.iterate(this);
  return undefined;
}});

// Likewise, JS expects repl-display objects to have a nullary method
// This dispatches to `show` in the object's namespace. If `show` isn't defined, just return the object and let the repl environment deal with it.
ludus_proto[Ludus.custom] = function () {
  let ns = meta(this)?.ns;
  if (ns == undefined) return undefined;
  if ('show' in ns) return ns.show(this);
  return this;
};

Object.defineProperty(ludus_proto, 'toString', {value: ludus_proto[Ludus.custom]});

///// Types
// Types are the prototypes for the metadata on any given object. Types hold hold four properties: a `name`; `type`, which is a circular reference; `ns`, which is a namespace associated with that type; and `methods`, which holds any methods that get added outside the core namespace.

// A Type type
let Type = Object.create(ludus_proto);
Type.name = 'Type';
Type.type = Type;
Type[meta_tag] = Object.create(ludus_proto);
Object.defineProperty(Type[meta_tag], 'ns', {get: () => Type.ns});
Type[meta_tag].type = Type;

// create :: (type, obj) -> type
// `create` is the way we create objects that aren't simply object literals
// in Ludus.
let create = (
  type, 
  // pull out the metadata from other attributes
  // NB: passing metadata should be a rare case in the early stages of boostrapping Ludus, since symbol tags aren't allowed in Ludus
  attrs = {}
  ) => {
  let meta = Object.prototype.hasOwnProperty.call(attrs, meta_tag)
    ? attrs[meta_tag]
    : Object.create(ludus_proto);
  delete attrs[meta_tag];
  // create a bare object
  let created = Object.assign(Object.create(ludus_proto), attrs);
  meta = Object.assign(Object.create(type), meta);
  created[meta_tag] = meta;
  return created;
};

// deftype :: (obj) -> type
// Defines a type. The `name` field is required
let deftype = (attrs) => {
  let type = create(Type, attrs);
  // a circular reference for type metadata
  type.type = type;
  // a place for methods not defined in a ns
  type.methods = {};
  return type;
};

// show_type :: (type) -> string
// displays a type as { Name }
let show_type = (type) => `{ ${type.name} }`;

// a special type for `undefined`.
let Undefined = deftype({name: 'Undefined'});

// type_of :: (any) -> type
// a simple type_of function
// only `undefined` needs a special case;
// everything else will have 
let type_of = (x) => x == undefined 
  ? Undefined
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
let Namespace = deftype({name: 'Namespace'});

// show_ns :: (namespace) -> string
// shows a namespace
let show_ns = (ns) => `Namespace { ${ns[meta_tag].name} }`;

// def :: (namespace, string, any) -> any
// `def` allows for dynamic manipulation of a namespace: add a member
// to a namespace you have a reference to
// This should be used very sparingly in actual Ludus, but helps us
// manage namespaces in the boostrapping prelude phases
let def = (ns, key, value) => { 
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

let members = (ns) => ns[members_tag];

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
let defns = ({name, type, members, ...attrs}) => {
  name = name != undefined || type.name;
  let meta = Object.assign(Object.create(ludus_proto), 
    type === undefined ? {name, ...attrs} : {name, type, ...attrs});
  let ns = create(Namespace, {
    name,
    [members_tag]: {...members},
    [meta_tag]: meta
  });
  let proxied = new Proxy(ns, ns_handler);
  if (type !== undefined) type.ns = proxied;
  return proxied;
};

// is_ns :: (any) -> boolean
// Tells if something is a namespace
let is_ns = (x) => is(Namespace, x);

///// Some namespaces to go with our existing types
// namespace namespace
let NS = defns({name: 'Namespace', type: Namespace,
  members: {is_ns, defns, defmembers, members, def, show: show_ns}});

// type namespace
let Type_ns = defns({name: 'Type', type: Type, 
  members: {show: show_type, deftype, type_of, is, meta, create}});

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

let Bool = deftype({name: 'Boolean'});
defns({name: 'Boolean', type: Bool, members: {}});
Boolean.prototype[meta_tag] = Bool;

let Num = deftype({name: 'Number'});
defns({name: 'Math', type: Num, members: {}})
Number.prototype[meta_tag] = Num;

let Str = deftype({name: 'String'});
defns({name: 'String', type: Str, members: {}});
String.prototype[meta_tag] = Str;

let Sym = deftype({name: 'Symbol'});
defns({name: 'Symbol', type: Sym, members: {}});
Symbol.prototype[meta_tag] = Sym;

let Obj = deftype({name: 'Object'});
defns({name: 'Object', type: Obj, members: {}});
Object.prototype[meta_tag] = Obj;

let Arr = deftype({name: 'Array'});
defns({name: 'Array', type: Arr, members: {}});
Array.prototype[meta_tag] = Arr;

let Fn = deftype({name: 'Function'});
defns({name: 'Function', type: Fn, members: {}});
Function.prototype[meta_tag] = Fn;

let types = {
  Boolean: Bool,
  Number: Num,
  String: Str,
  Symbol: Sym,
  Object: Obj,
  Array: Arr,
  Function: Fn,
  Undefined
};

defmembers(Type_ns, {t: types, types, ...types});

let show = (x) => {
  let ns = meta(x)?.ns;
  if (ns == undefined) return 'undefined';
  if ('show' in ns) return ns.show(x);
  return x;
};

//////////////////// 5. Exports
export {NS, Type_ns as Type};
export default defns({name: 'Ludus', members: {...Ludus, show, NS, Type: Type_ns}});
