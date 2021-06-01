//////////////////// Sequences
// Sequences allow for abstracted lazy iteration across anything
// that can be iterated over: arrays, vectors, lists, strings,
// objects, generators, and anything else that implements the Javascript
// iteration protocol.
// Sequences follow two protocols:
// - they implement the Javascript iterator protocol
// - they have `first` and `rest` properties (or getters), which
//    should be stateless
// Seqs are immutable and stateless, and are an abstraction over
// any number of things.

import P from './preds.js';
import Fn from './fns.js';
import S from './spec.js';
import T from './type.js';
import NS from './ns.js';
import A from './arr.js';

let {args, seq, type, fn, coll, any} = S;
let {defn, once, defmethod, recur} = Fn;
let {create, deftype, is} = T;
let {has, is_iter, is_assoc, bool} = P;
let {ns} = NS;
let {conj_} = A;

// obj_gen: creates a generator that iterates through the keys of an object
// only covers string keys
// only outputs own properties
// is lazy
// not exported
let obj_gen = function* (obj) {
  for (let key in obj) {
    if (has(key, obj)) yield [key, obj[key]];
  }
};

let seq_t = deftype({name: 'Seq'});

// iterate: creates an iterator over a seq
// uses a closure to get JS iterator behavior on something that
// implements first/rest semantics.
// in a seq
let iterate = defn({
  name: 'iterate',
  doc: 'Creates an iterator over a `seq`.',
  pre: args([type(seq_t)]),
  body: (seq) => () => {
    let first = seq.first();
    let rest = seq.rest();

    return {
      next () {
        if (rest === undefined) return {done: true}
        let next = {value: first, done: rest === undefined};
        first = rest.first();
        rest = rest.rest();
        return next;
      }
    }
  }
});

let show = defn({
  name: 'show',
  doc: 'Shows a `seq`.',
  pre: args([type(seq_t)]),
  body: (seq) => seq.size != undefined ? `Seq(${seq.size})` : 'Seq(...)'
});

let is_seq = defn({
  name: 'is_seq',
  doc: 'Tells if something is a `seq`. Note that this means it is an actual instance of `seq`--lazy and abstract--and not something that is seqable. For that, use `coll`.',
  body: (x) => is(seq_t, x) 
});

let count = defn({
  name: 'count',
  doc: 'Determines the size of a collection.',
  pre: args([coll]),
  body: (x) => {
    if (x.length != undefined) return x.length;
    if (x.size != undefined) return x.size;
    if (is_assoc(x)) return Reflect.ownKeys(x).length;
    return undefined;
  }
});

// create_seq: takes anything that conforms to the iteration protocol
// and returns a seq over it
// seqs themselves conform to the iteration protocol
// they also have `first` and `rest` methods
// they are immutable, stateless, and lazy
// not exported, but used to build `seq`s
let create_seq = (iterator, size) => {
  let current = iterator.next();
  let rest = once(() => current.done ? undefined : create_seq(iterator));
  let first = () => current.done ? undefined : current.value;
  let out = create(seq_t, {rest, first, size});
  return out;
};

let seq_ = defn({
  name: 'seq',
  doc: 'Generates a `seq` over any `iterable` thing: `list` & `vector`, but also `string` and `object`. `seq`s are lazy iterables, and they can be infinite.',
  pre: args([coll], [fn, coll]),
  body: [
    (seqable) => {
      // if it's already a seq, just return it
      if (is_seq(seqable)) return seqable;
      // if it's undefined, return an empty seq
      if (seqable == undefined) return empty();
      // if it's iterable, return a seq over a new iterator over it
      // js: strings, arrays, Maps, and Sets are iterable
      // ld: vectors and lists are iterable
      if (is_iter(seqable)) 
        return create_seq(seqable[Symbol.iterator](), count(seqable));
      // if it's a record (object literal) return a seq over an object generator
      if (is_assoc(seqable)) return create_seq(obj_gen(seqable), count(seqable));
      // otherwise we don't know what to do; throw your hands up
      // however, with our precondition, we should never get here.
      throw TypeError(`${seqable} is not seqable.`);
    },
    (xform, seqable) => seq_(xform_seq(xform, seqable))
  ]
});

let xform_seq = function* (xform, coll) {
  let seq = seq_(coll);
  console.log([...seq]);
  let queue = [];
  while (!is_empty(seq) && queue.length === 0) {
    queue = xform(conj_)([], first(seq));
    if (is_complete(queue)) {
      queue = queue.value;
    }
    for (let x of queue) {
      console.log(x);
      yield x;
    }
    seq = rest(seq);
    queue = [];
  }
}

let empty_seq = seq_([]);

let empty = defn({
  name: 'empty',
  doc: 'Returns an empty seq.',
  body: () => empty_seq
});

let concat = defn({
  name: 'concat',
  doc: 'Concatenates `seq`s, placing one after the other.',
  pre: seq(coll),
  body: (...colls) => {
    let generator = (function*(){
      for (let coll of colls) {
        yield* seq_(coll);
      }
    })();
    let concat_size = colls.reduce((acc, seq) => acc + count(seq), 0);
    concat_size = isNaN(concat_size) ? undefined : concat_size;
    return create_seq(generator, concat_size);
  }
});

let first = defn({
  name: 'first',
  doc: 'Gets the first element of any `seq`able.',
  pre: args([coll]),
  body: (coll) => seq_(coll).first()
});

let rest = defn({
  name: 'rest',
  doc: 'Returns a `seq` containing all elements but the first of a `seq`able.',
  pre: args([coll]),
  body: (coll) => seq_(coll).rest() || empty_seq
});

let is_empty = defn({
  name: 'is_empty',
  doc: 'Tells if a seqable is empty.',
  pre: args([coll]),
  body: (coll) => rest(seq_(coll)) === empty_seq
});

let completed = Symbol('ludus/completed');

let complete = defn({
  name: 'complete',
  doc: 'Short-circuits `reduce`, returning the value and halting the reduction. Used to optimize transducers that do not traverse a whole collection.',
  body: (value) => ({value, [completed]: true})
});

let is_complete = defn({
  name: 'is_complete',
  doc: 'Tells if a value, presumably passed to a reducing function, has completed the reduction.',
  body: (x) => x != undefined && bool(x[completed])
});

let reduce = defn({
  name: 'reduce',
  pre: args([fn, coll], [fn, any, coll]),
  body: [
    (f, coll) => reduce(f, first(coll), rest(coll)),
    (f, accum, coll) => {
      for (let x of seq_(coll)) {
        accum = f(accum, x);
        if (is_complete(accum)) return accum.value;
      }
      return accum;
    }
  ]
});

let transduce = defn({
  name: 'transduce',
  doc: 'Transduce is a transforming reducer. (Again, explaining this? Ugh.)',
  pre: args([fn, fn, coll], [fn, fn, any, coll]),
  body: [
    (xform, reducer, coll) => reduce(xform(reducer), coll),
    (xform, reducer, accum, coll) => reduce(xform(reducer), accum, coll)
  ]
});

let concat_m = defmethod({name: 'concat'});

let into = defn({
  name: 'into',
  doc: 'Takes the contents of one collection and puts them into another, working across types. Takes an optional transducer.',
  pre: args([coll, coll], [coll, fn, coll]),
  body: [
    (to, from) => concat_m(to, seq_(from)),
    (to, xform, from) => concat_m(to, transduce(xform, A.conj_, [], from))
  ]
});

export default ns({
  type: seq_t,
  members: {
    concat, empty, first, is_empty, is_seq, 
    iterate, rest, seq: seq_, show, count,
    reduce, transduce, into, complete, is_complete
  }});
