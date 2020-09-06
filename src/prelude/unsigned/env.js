//////////////////// The Ludus environment, for bootstrapping even `prelude`
// This is the absolute core of Ludus.

import {create} from './util.js';

//////////////////// Detecting our runtime
// TODO: add IO operations
//  [ ] read file
//  [ ] read from stdin
//  [ ] devise browser equivalents (CodeMirror, for much later)
let Ludus = {
  show: (x) => {
    if (typeof x === 'symbol') return x.toString();
    if (typeof x === 'string') return `'${x}'`;
    if (typeof x === 'function') return `[λ${x.name ? ': ' + x.name : ''}]`;
    if (x == null) return undefined;
    if (x[Ludus.custom]) return x[Ludus.custom]();
    return x;
  },
  custom: Symbol.for('ludus/show/custom'),
  print: (...msgs) => { msgs.forEach(x => console.log(x)); },
  report: (...msgs) => { msgs.forEach(msg => console.error(msg)); },
  warn: (...msgs) => { msgs.forEach(msg => console.warn(msg)); }
};

// if we are running in Deno
if (typeof Deno !== 'undefined') {
  Ludus.runtime = 'deno';
  Ludus.show = x => {
    x = x === null ? 'undefined' : x;
    return Deno.inspect(x);
  }
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
}

//////////////////// Namespaces
// A namespace represents a collection of functions and values.
// Namespaces are, effectively, JS objects, but with a single modification:
// they throw an error when something or someone tries to access a property
// they don't have.
// The Ludus interpreter/compiler will allow dot-property access *only* for
// namespace objects.
// exports a single function: `ns`, which constructs a namespace

class NamespaceError extends Error {};

let def_tag = Symbol('ludus/ns/def');
let space_tag = Symbol('ludus/ns/space');

// ns_handler
// a proxy object for namespaces
// manipulates access to namespaces
let ns_handler = {
  has (target, key) {
    return key in target.space;
  },
  get (target, key) {
    if (key in target[ns_space_tag]) return target[ns_space_tag][key];
    if (typeof key === 'symbol') return target[key];
    /*
    if (key === 'name') return target.name;

    let target_proto = Reflect.getPrototypeOf(target);

    if (key in target_proto) return target_proto[key];
    if (key in target) return target[key];
    if (key in target.space) return target.space[key];
    if (key === space_tag) return target.space;
    */
    throw ReferenceError(`${key.toString()} is not defined in namespace ${target[ns_name_tag]}.`);
  },
  set () {
    throw NamespaceError('You may only add to namespaces by using `def`.')
  },
  ownKeys (target) {
    return Reflect.ownKeys(target[ns_space_tag]);
  }
};

// Namespace prototype
let Namespace = {
  name: 'Namespace',
  get constructor () { return Namespace; },
  [Ludus.custom] () {
    return `Namespace { ${this[ns_name_tag]} }`;
  },
  [def_tag] (key, value) {
    this[ns_space_tag][key] = value;
  }
};

// ns :: ({name: string, space: object, ...attrs}) -> ns
// Creates a namespace.
let ns_name_tag = Symbol.for('ludus/ns/name');
let ns_space_tag = Symbol.for('ludus/ns/space');
let ns_attr_tag = Symbol.for('ludus/ns/attr');

let ns = ({name, space, ...attrs}) => {
  let the_ns = create(Namespace, {
    [ns_name_tag]: name,
    [ns_space_tag]: space,
    [ns_attr_tag]: attrs
  });
  let proxied = new Proxy(the_ns, ns_handler);
  return proxied;
};

let def = (namespace, key, value) => {
  namespace[def_tag](key, value);
  return value;
};

let is_ns = (x) => x != undefined && Object.getPrototypeOf(x) === Namespace;

Object.assign(Ludus, {ns, def, is_ns});

Ludus.NamespaceError = NamespaceError;

let Ludus_ns = Ludus.ns({name: 'Ludus', space: Ludus});

globalThis.Ludus = Ludus_ns;

export default Ludus_ns;