let equals = Symbol.for('ludus/eq');

let strict_equal = (x, y) => x === y;

let atomics = [Boolean, Symbol, Number, String];

atomics.forEach((constr) => { constr[equals] = strict_equal; });

Function[equals] = strict_equal;

let eq = (x, y) => {
  if (x === y) return true;
  if (x == null) return y == null;
  let x_eq = x[equals] || x.constructor[equals];
  if (x_eq == null) return x === y;
  return x_eq(x, y);
};

Array[equals] = (x, y) => {
  if (!Array.isArray(y)) return false;
  if (x.length !== y.length) return false;
  for (let i = 0; i < x.length; i++) {
    if (!eq(x[i], y[i])) return false;
  }
  return true;
};

Object[equals] = (x, y) => {
  if (y == null) return false;
  if (Reflect.getPrototypeOf(x) !== Reflect.getPrototypeOf(y)) return false;
  let x_keys = Object.keys(x);
  let y_keys = Object.keys(y);
  if (x_keys.length !== y_keys.length) return false;
  for (let key of x_keys) {
    if (!eq(x[key], y[key])) return false;
  }
  let x_syms = Object.getOwnPropertySymbols(x);
  let y_syms = Object.getOwnPropertySymbols(y);
  if (x_syms.length !== y_syms.length) return false;
  for (let sym of x_syms) {
    if (!eq(x[sym], y[sym])) return false;
  }
  return true;
};

export {equals, eq, strict_equal};