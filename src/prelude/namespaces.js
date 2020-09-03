//////////////////// Namespaces
// A namespace represents a collection of functions and values.
// Namespaces are, effectively, JS objects, but with a single modification:
// they throw an error when something or someone tries to access a property
// they don't have.
// The Ludus interpreter/compiler will allow dot-property access *only* for
// namespace objects.
// exports a single function: `ns`, which constructs a namespace

import * as env from './environment.js';

// ns_handler
// a proxy object for namespaces
// manipulates access to namespaces
let ns_handler = {
  has (target, key) {
    return key in target.space;
  },
  get (target, key) {
    if (key === 'name') return target.name;

    let target_proto = Reflect.getPrototypeOf(target);

    if (key in target_proto) return target_proto[key];
    if (key in target.attrs) return target.attrs[key];
    if (key in target.space) return target.space[key];
    throw ReferenceError(`${key.toString()} is not defined in namespace ${target.name}.`);
  },
  ownKeys (target) {
    return Reflect.ownKeys(target.space);
  }
};

// Namespace prototype
let Namespace = {
  name: 'Namespace',
  get constructor () { return Namespace; },
  [globalThis[Symbol.for('ludus/inspect/custom')]] () {
    this
    return `Namespace { ${this.name} }`;
  }
};

// ns :: ({name: string, space: object, ...attrs}) -> ns
// Creates a namespace.
let ns = ({name, space, ...attrs}) => {
  name
  let the_ns = Object.assign(Object.create(Namespace), {name, space, attrs});
  the_ns.name
  let proxy = new Proxy(the_ns, ns_handler);
  proxy.name //?
  return proxy;
};

export {ns};
