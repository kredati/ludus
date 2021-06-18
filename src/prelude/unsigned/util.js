//////////////////// A few helpful utilities
// That don't belong in other modules

// copies attributes onto an object, typically a function in ludus,
// as non-enumerable, non-configurable properties of the target
// object
let copy_attrs = (obj, attrs) => {
  let keys = [
    ...Object.getOwnPropertyNames(attrs),
    ...Object.getOwnPropertySymbols(attrs)
  ];
  for (let key of keys) {
    Object.defineProperty(obj, key, {
      value: attrs[key],
      enumerable: false,
      //configurable: false
    })
  }
  return obj;
};

Number.prototype[Symbol.iterator] = function* () {
  let self = Number(this);
  let out = 0;
  while (out < self) {
    yield out;
    out += 1;
  }
};

export {copy_attrs};