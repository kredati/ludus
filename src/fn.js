let call = (fn, ...args) => fn(...args);

let apply = (fn, args) => fn(...args);

let rename = (name, fn) => Object.defineProperty(fn, 'name', {value: name});

let partial = (fn, ...args1) => rename(
  `${fn.name}<partially applied>`, 
  (...args2) => call(fn, ...args1, ...args2));

let raise = (error, message) => { throw new error(message) };

class ArityError extends Error {}

let n_ary = (...fns) => {
  let arity_map = fns.reduce((map, fn) => Object.assign(map, {[fn.length]: fn}), {});

  let match_arity = (...args) => {
    let arity = args.length,
      match = arity_map[arity];

    return match 
      ? match(...args) 
      : raise(ArityError, `I was expecting ${Object.keys(arity_map).join(' or ')} arguments, but received ${args.length}.`) 
  };

  return rename('multifunction', match_arity);

};

let compose = (f1, f2) => (...args) => f1(f2(...args));

let forward = (f1, f2) => compose(f2, f1);

let add = (x, y) => x + y;
let mult = (x, y) => x * y;

let inc = partial(add, 1);

let pipeline = ([first, ...rest]) => (...args) => {
  let result = first(...args);
  for (let f of rest) {
    result = f(result);
  }
  return result;
};

let pipe_some = ([first, ...rest]) => (...args) => {
  let result = first(...args);
  if (result == null) return result;
  for (let f of rest) {
    result = f(result);
    if (result == null) return result;
  }
  return result;
}

let pipe_safe = ([first, ...rest]) => (...args) => {
  let result = bound(first)(...args);
  if (result instanceof Error) {
    console.error(`Error in pipeline while calling ${first.name} with [${args.join(', ')}]`);
    throw result;
  }
  for (let f of rest) {
    result = bound(f)(result);
    if (result instanceof Error) {
      console.error(`Error in pipeline while calling ${first.name} with [${args.join(', ')}]`);
      throw result;
    }
  }
  return result;
}

let bound = fn => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return e;
  }
};