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

import L from './deps.js';
import P from './preds.js';
import Fn from './fns.js';
import S from './spec.js';
import T from './type.js';
import NS from './ns.js';

let {args, seq, sequence, type} = S;
let {defn, once} = Fn;
let {create, deftype, is} = T;
let {has, is_iter, is_assoc} = P;
let {ns} = NS;

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
  doc: 'Tells if something is a `seq`. Note that this means it is an actual instance of `seq`--lazy and abstract--and not something that is seqable. For that, see `is_seqable`.',
  body: (x) => is(seq_t, x) 
});

let is_seqable = defn({
  name: 'is_seqable',
  doc: 'Tells if a `seq` can be generated over a value. This will return true for `string`s, `object`s, and `iterables`.',
  body: (x) => is_iter(x) || is_assoc(x) 
});

let seqable = L.Spec.defspec({name: 'seqable', pred: is_seqable});

let size = defn({
  name: 'size',
  doc: 'Determines the size of a collection.',
  pre: args([seqable]),
  body: (x) => {
    if (x.length != undefined) return x.length;
    if (x.size != undefined) return x.size;
    if (is_assoc(x)) return Reflect.ownKeys(x).length;
    return undefined;
  }
});

// make_seq: takes anything that conforms to the iteration protocol
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
  pre: args([seqable]),
  body: (seqable) => {
    // if it's already a seq, just return it
    if (is_seq(seqable)) return seqable;
    // if it's undefined, return an empty seq
    if (seqable == undefined) return empty;
    // if it's iterable, return a seq over a new iterator over it
    // js: strings, arrays, Maps, and Sets are iterable
    // ld: vectors and lists are iterable
    if (is_iter(seqable)) 
      return create_seq(seqable[Symbol.iterator](), size(seqable));
    // if it's a record (object literal) return a seq over an object generator
    if (is_assoc(seqable)) return create_seq(obj_gen(seqable), size(seqable));
    // otherwise we don't know what to do; throw your hands up
    // however, with our precondition, we should never get here.
    throw TypeError(`${seqable} is not seqable.`);
  }
});

let empty_seq = seq_([]);

let empty = defn({
  name: 'empty',
  doc: 'Returns an empty seq.',
  body: () => empty_seq
});

let concat = defn({
  name: 'concat',
  doc: 'Concatenates `seq`s, placing one after the other.',
  pre: seq(sequence),
  body: (...seqables) => {
    let generator = (function*(){
      for (let seqable of seqables) {
        yield* seq_(seqable);
      }
    })();
    let concat_size = seqables.reduce((acc, seq) => acc + size(seq), 0);
    concat_size = isNaN(concat_size) ? undefined : concat_size;
    return create_seq(generator, concat_size);
  }
});

let first = defn({
  name: 'first',
  doc: 'Gets the first element of any `seq`able.',
  pre: args([seqable]),
  body: (seqable) => seq_(seqable).first()
});

let rest = defn({
  name: 'rest',
  doc: 'Returns a `seq` containing all elements but the first of a `seq`able.',
  pre: args([seqable]),
  body: (seqable) => seq_(seqable).rest() || empty_seq
});

let is_empty = defn({
  name: 'is_empty',
  doc: 'Tells if a seqable is empty.',
  pre: args([seqable]),
  body: (seqable) => rest(seq_(seqable)) === empty_seq
});

export default ns({
  type: seq_t,
  members: {
    concat, empty, first, is_empty, is_seq, is_seqable, seqable, 
    iterate, rest, seq: seq_, show, size
  }});
