//////////////////// Environment
// Ludus will run in node, deno, and browsers.
// This file exists to help harmonize the code so those differences
// can largely be abstracted away. This file exports nothing,
// and instead manipulates the global namespace.
// In theory, with es modules, it should only be run once.

let inspect_tag = Symbol.for('ludus/inspect');
let custom_tag = Symbol.for('ludus/inspect/custom');
let env_tag = Symbol.for('ludus/env');

globalThis.Ludus = {};

// if we are running in Deno
if (typeof Deno !== 'undefined') {
  console.log('Deno!');
  'Deno!' //?
  globalThis[inspect_tag] = Deno.inspect;
  globalThis[custom_tag] = Deno.customInspect;
  globalThis[env_tag] = 'deno';
}

// if we are running in Node
else if (typeof process !== 'undefined') {
  console.log('Node!');
  'Node!' //?
  globalThis[inspect_tag] = x => x;
  globalThis[custom_tag] = Symbol.for('nodejs.util.inspect.custom');
  globalThis[env_tag] = 'node';
}

// if we are running in a broswer
else if (typeof window !== 'undefined') {
  console.log('Browser!');
  'Browser!' //?
  // I don't know what to do here, not yet.
  globalThis[env_tag] = 'browser';
}

// if we are running in another environment: 🤷‍♂️
else {
  throw Error('Ludus is running in an unknown environment. We frankly don\'t know what to do with ourselves.');
}

let custom = globalThis[Symbol.for('ludus/inspect/custom')];
let inspect = globalThis[Symbol.for('ludus/inspect')];
let env = globalThis[Symbol.for('ludus/env')];

console.log(globalThis[env_tag]);

export {custom, inspect, env};