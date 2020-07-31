let get = (key, map) => map == null ? null : map[key] || null;

let otherwise = Symbol.for('ludus/otherwise');
let _ = otherwise;

let rename = (name, obj) => Object.defineProperty(obj, 'name', {value: name});

let multi = (name, lookup_fn) => {

  let methods = new Map();

  let get = (value) => methods.get(lookup_fn(value)) || methods.get(otherwise) || (() => Error('oops'));

  let set = (value, fn) => {
    if (methods.has(value)) return Error('oops');
    methods.set(value, rename(name, fn));
    return dispatch;
  };

  let dispatch = rename(name, (type, ...args) => get(type)(type, ...args));

  dispatch.set = set;

  return dispatch;

};

let method = (multi, value, fn) => multi.set(value, fn);

let rect = {};
let circle = {};

let area = multi('area', o => get('shape', o))

let rect_area = method(area, rect, ({height, width}) => height * width);
let circle_area = method(area, circle, ({radius}) => Math.PI * (radius ** 2));
method(area, _, () => 'nothing to see here');

area({shape: circle, radius: 2}) //=
area({shape: rect, width: 2, height: 3}) //=
area() //=

let type = x => x === null ? null : x.constructor;

let foo = multi('foo', type);
method(foo, String, () => 'string foo')
method(foo, Number, () => 'number foo')
method(foo, Object, () => 'object foo')
method(foo, _, () => 'foo')

foo(42) //=
foo('') //=
foo({}) //=
foo(null) //=

