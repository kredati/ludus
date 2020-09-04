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
      configurable: false
    })
  }
  return obj;
};

// creates an object with a given prototype, and then assigns the properties
// of the passed attributes.
let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

export {copy_attrs, create};