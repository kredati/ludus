let boolean = x => !(x === false || x == null);

let obj_gen = function* (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) yield [key, obj[key]];
  }
};

let is_iterable = x => x != null && typeof x[Symbol.iterator] === 'function';

let quux = [0, 1, 2]

let iterate = lazy => {
  let first = lazy.first(),
    rest = lazy.rest();
  return {
    next () {
      if (rest === null) return {done: true}
      let next = {value: first, done: rest === null};
      first = rest.first();
      rest = rest.rest();
      return next;
    }
  }
};

let never = Symbol('never');
let once = fn => {
  let result = never;
  let go = (...args) => {
    if (result === never) result = fn(...args);

    return result;
  }

  return Object.defineProperty(go, 'name', {value: fn.name});
}; 

let lazy_iterator = (iterator) => {
  let current = iterator.next();
  let rest = once(() => current.done ? null : lazy_iterator(iterator));
  let first = () => current.done ? null : current.value;
  let out = {
    [Symbol.iterator] () {
      return iterate(out);
    },
    rest,
    first
  }
  return out;
}

let seq = (seqable) => {
  if (seqable === null) return seq([]);
  if (is_iterable(seqable)) return lazy_iterator(seqable[Symbol.iterator]());
  if (typeof seqable === 'object') return lazy_iterator(obj_gen(seqable));
  throw Error(`${seqable} is not seqable.`);
};

let cons_gen = function* (value, seq) {
  console.log(value)
  yield value;
  yield* seq;
}

let first = (seq) => seq === null ? null : seq.first();
let rest = (seq) => seq === null ? null : seq.rest();
let cons = (value, seq_) => seq(cons_gen(value, seq_));
let conj = (seq_, value) => cons(value, seq_);
let is_empty = seq => rest(seq) === null;
let count;
let transduce;

let baz = seq(null); //=
let foo = cons(3, baz);
let bar = cons(4, foo); //=
[...bar] //=