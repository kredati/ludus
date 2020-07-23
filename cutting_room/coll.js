// some notes
// the core abstraction here is a generator
// but we can implement the generator/iterator protocol while also
// allowing the protocol to give you not just first() but rest().
// that means getting much, much closer to immutability

let array = {
  empty: () => [],
  count: arr => arr.length,
  first: ([first]) => first || null,
  next: ([_, ...next]) => next.lenth ? next : null,
  rest: ([_, ...rest]) => rest,
  concat: (arr, ...concats) => arr.concat(...concats),
  conj: (arr, ...items) => concat(arr, items),
  eq: (first, second, f = (x, y) => x === y) => 
    array.count(first) === array.count(second) 
    && first.every((_, i) => f(first[i], second[i]))
};

let string = {
  empty: () => '',
  count: s => s.length,
  first: s => s[0] || null,
  next: s => s.slice(1, s.length) || null,
  rest: s => s.slice(1, s.length),
  concat: (s1, ...s2) => s1.concat(...s2),
  conj: (s1, s2) => s1 + s2,
  eq: (s1, s2) => s1 === s2
};

let make_object_iterable = function* (obj) {
  for (let key in obj) {
    yield [key, obj[key]];
  }
};

let make_array_iterable = function* (arr) {
  for (let el of arr) {
    yield el;
  }
};

let make_string_iterable = function* (str) {
  for (let char of str) {
    yield char;
  }
};

let str_iter = make_string_iterable('foobar')
str_iter.next() //=

let proto_gen = Object.getPrototypeOf(make_object_iterable({}))

let iter = make_object_iterable({a: 1, b: 2, c: 3}) //=
iter.next() //=
iter.next() //=
iter.next() //=
iter.next() //=
Object.getPrototypeOf(iter) === proto_gen //=

let object = {
  empty: () => ({}),
  count: o => Object.keys(o).length,
  first: o => Object.entries(o)[0],
  rest: o => array.rest(Object.entries(o)),
  next: o => array.next(Object.entries(o)),
  conj: (o, [key, value]) => ({...o, [key]: value})
}

let has_props = x => x != null && (typeof x === 'function' || typeof x === 'object');

let exists = x => x !== undefined;

has_props() //=

let get = (key, map) => has_props(map) ? exists(map[key]) ? map[key] : null : null;

let list = {
  empty: () => null,
  first: l => get('value', l),
  next: l => get('next', l),
  rest: l => list.next(l),
  conj: (next, value) => ({next, value}),
  cons: (value, next = null) => ({next, value}),
  list: (...items) => items.reduceRight((l, item) => list.conj(l, item), null)
};

let make_list_iterable = function* (l) {
  let _l = l;
  let f = list.first(_l);
  while (f) {
    yield f;
    _l = list.rest(_l);
    f = list.first(_l);
  }
}

let reduce = (f, init, coll) => {
  let accum = init;
  for (let e of coll) {
    accum = f(accum, e);
  }
  return accum;
}

let liter = make_list_iterable(list.list(1, 2, 3));
