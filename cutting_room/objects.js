import {n_ary, no_op} from './fn.js'

let derive = n_ary('derive',
  (name) => derive(name, Object, no_op),
  (name, fn) => is_constructor(fn) 
    ? derive(name, fn, no_op) 
    : derive(name, Object, fn),
  (name, proto, fn) => {
    class derived extends proto {
      constructor(...args) {
        super();
        Object.defineProperty(this, 'name', {value: name});
        Object.assign(this, fn(...args));
      }
    }
    Object.defineProperty(derived, 'name', {value: name});
    return derived;
  });

let is_constructor = f => {
  try {
    Reflect.construct(String, [], f);
  } catch (e) {
    return false;
  }
  return true;
};

let create = (constructor, ...args) => new constructor(...args);

let type = x => x == null ? null : x.constructor;

let is_instance_of = (constr, instance) => instance instanceof constr;

export {derive, create, type, is_instance_of};