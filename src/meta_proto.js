// A sketch of prototype/module/meta dispatch

let define_property = (obj, key, value) => {
  if (obj[key] != undefined) return obj;
  return Object.defineProperty(obj, key, {value});
}

let Math_ns = { foo: 42 };
define_property(Number.prototype, 'ludus/ns', Math_ns);

let String_ns = { foo: '42' };
define_property(String.prototype, 'ludus/ns', String_ns);

let Bool_ns = {foo: true };
define_property(Boolean.prototype, 'ludus/ns', Bool_ns);

let Array_ns = { foo: [42] };
define_property(Array.prototype, 'ludus/ns', Array_ns);

let Obj_ns = {foo: {foo: 42} };
define_property(Object.prototype, 'ludus/ns', Obj_ns);

let Vect_ns = { foo: {x: 42, y: 23} };
let origin = {'ludus/ns': Vect_ns, x: 0, y: 0};

(4)['ludus/ns'].foo; //?
('')['ludus/ns'].foo; //?
([])['ludus/ns'].foo; //?
({})['ludus/ns'].foo; //?
origin['ludus/ns'].foo; //?