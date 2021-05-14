//////////////////// Refs, or how Ludus does state
// Refs are the way Ludus handles state, which is also to say persistence,
// which is also to say asynchronicity. They are modeled on Clojure's Atoms,
// but Ludus calls "atoms" simple datatypes (e.g., strings, numbers, bools).

import * as env from './environment.js';

// a cute helper I keep using
// TODO: put this somewhere
let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

// a tag to mark references as different from everything else
let ref_tag = Symbol('ludus/ref');

// a Ref prototype object
let Ref = {
  name: 'Ref',
  [ref_tag] () { return this.constructor; },
  get constructor () { return Ref; },
  [globalThis[Symbol.for('ludus/inspect/custom')]] () {
    let inspect = globalThis[Symbol.for('ludus/inspect')];
    return `Ref${this.name ? ': ' + this.name : '' } { ${inspect(this.value)} }`;
  }
};

let ref = ({name, value, ...attrs}) => 
  create(Ref, {name, value, watchers: [], attrs});

let deref = ({value}) => value;

let swap = (ref, new_value) => {
  ref.value = new_value;
  future(ping_watchers, [ref]);
  return ref; // is this the right return value?
};

let ping_watchers = (ref) => {
  ref.watchers.forEach(([fn, args]) => {
    fn(deref(ref), ...args); // TODO: debounce this?
  });
  return undefined;
};

let watch = (ref, fn, ...args) => {
  ref.watchers.push([fn, args]);
  future(fn, [deref(ref), ...args]); // TODO: don't call the watcher right away
  return ref; // is this the right return value?
};

let unwatch = (ref, fn) => {
  let {watchers} = ref;
  let new_watchers = [];
  for (let i = 0; i < watchers.length; i++) {
    let [watcher] = watchers[i];
    if (watcher === fn) continue;
    new_watchers.push(watchers[i]);
  }
  ref.watchers = new_watchers;
  return ref;
};

let future = (fn, args = [], timeout = 0) => {
  setTimeout(() => { fn(...args); }, timeout);
  return undefined;
};

export {ref, deref, swap, watch, unwatch, future};
