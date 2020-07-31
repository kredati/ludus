import {raise, report} from './error.js'

let call = (fn, ...args) => fn(...args);

let apply = (fn, args) => fn(...args);

let rename = (name, fn) => Object.defineProperty(fn, 'name', {value: name});

let partial = (fn, ...args1) => rename(
  `${fn.name}<partially applied>`, 
  (...args2) => call(fn, ...args1, ...args2));

let n_ary = (name, ...fns) => {
  let arity_map = fns.reduce((map, fn) => Object.assign(map, {[fn.length]: fn}), {});

  let match_arity = (...args) => {
    let arity = args.length,
      match = arity_map[arity];

    return match 
      ? match(...args) 
      : raise(Error, `Wrong number of arguments to ${name}. It takes ${Object.keys(arity_map).join(' or ')} argument(s), but received ${args.length}.`) 
  };

  return rename(name, match_arity);

};

let compose = (f1, f2) => (...args) => f1(f2(...args));

let forward = (f1, f2) => compose(f2, f1);

let pipe = (...fns) => rename('pipeline', x => {
  for (let f of fns) {
    try {
      x = f(x);
    } catch (e) {
      report(`Error thrown in function while calling ${f.name} with ${x}.`);
      throw e;
    }
  }
  return result;
});

let pipe_some = (...fns) => rename('pipeline', x => {
  for (let f of fns) {
    try {
      x = f(x);
      if (x == null) return x;
    } catch (e) {
      report(`Error thrown in function while calling ${f.name} with ${x}.`);
      throw e;
    }
  }
  return x;
});

let bound = fn => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return e;
  }
};

let recur_tag = Symbol('ludus/recur');
let recur = (...args) => ({[recur_tag]: true, args});

let loop = (fn) => rename(`${fn.name}<looped>`, (...args) => {
  let result = fn(...args);
  while (result[recur_tag]) {
    result = fn(...result.args);
  }
  return result;
});

let never = Symbol('ludus/never');
let once = (fn) => {
  let result = never;
  return rename(fn.name, (...args) => {
    if (result === never) result = fn(...args);
    return result;
  });
};

let id = x => x;

let no_op = () => {};

export {
  call, 
  apply, 
  rename, 
  partial, 
  n_ary, 
  compose, 
  forward, 
  pipe, 
  pipe_some, 
  bound,
  loop,
  recur,
  once,
  id,
  no_op
};