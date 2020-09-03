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

import Ludus from './env.js';
import {is_iter, is_assoc, is_some} from './predicates.js';
import {create} from './types.js';
import {defn, once} from './functions.js';

// obj_gen: creates a generator that iterates through the keys of an object
// only covers string keys
// only outputs own properties
// is lazy
// not exported
let obj_gen = function* (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) yield [key, obj[key]];
  }
};

// iterate: creates an iterator over a seq
// not exported, but used to implement the iterator protocol
// in a seq
let iterate = (seq) => {
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
};

let Seq = {
  [Symbol.iterator] () {
    return iterate(this);
  },
  // TODO: make this prettier, show first n items?
  [Ludus.custom] () {
    return is_some(this.size) 
      ? `Seq(${this.size})`
      : `Seq(...)`;
  }
};

let is_seq = defn({
  name: 'is_seq',
  doc: 'Tells if something is a `seq`. Note that this means it is an actual instance of `seq`--lazy and abstract--and not something that is seqable. For that, see `is_seqable`.',
  body: (x) => is_some(x) && Object.getPrototypeOf(x) === Seq
});

let is_seqable = defn({
  name: 'is_seqable',
  doc: 'Tells if a `seq` can be generated over a value. This will return true for `string`s, `object`s, and `iterables`.',
  body: (x) => is_iter(x) || is_assoc(x) 
});

let size = defn({
  name: 'size',
  doc: 'Determines the size of a collection.',
  pre: [is_seqable],
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
  let out = create(Seq, {rest, first, size});
  return out;
};

let seq = defn({
  name: 'seq',
  doc: 'Generates a `seq` over any `iterable` thing: `list` & `vector`, but also `string` and `object`. `seq`s are lazy iterables, and they can be infinite.',
  pre: [is_seqable],
  body: (seqable) => {
    // if it's already a seq, just return it
    if (is_seq(seqable)) return seqable;
    // if it's undefined, return an empty seq
    if (seqable == undefined) return seq([]);
    // if it's iterable, return a seq over a new iterator over it
    // strings, arrays, Maps, and Sets are iterable
    if (is_iter(seqable)) 
      return create_seq(seqable[Symbol.iterator](), size(seqable));
    // if it's a record (object literal) return a seq over an object generator
    if (is_assoc(seqable)) return create_seq(obj_gen(seqable), size(seqable));
    // otherwise we don't know what to do; throw your hands up
    // however, with our precondition, we should never get here.
    throw TypeError(`${seqable} is not seqable.`);
  }
});

let empty_seq = seq([]);

let concat = defn({
  name: 'concat',
  doc: 'Concatenates `seq`s, placing one after the other.',
  pre: [(...seqables) => seqables.every(is_seqable)],
  body: (...seqables) => {
    let generator = (function*(){
      for (let seqable of seqables) {
        yield* seq(seqable);
      }
    })();
    let concat_size = seqables.reduce((acc, seq)=> acc + size(seq), 0);
    concat_size = isNaN(concat_size) ? undefined : concat_size;
    return create_seq(generator, concat_size);
  }
});

let first = defn({
  name: 'first',
  doc: 'Gets the first element of any `seq`able.',
  body: (seqable) => seq(seqable).first()
});

let rest = defn({
  name: 'rest',
  doc: 'Returns a `seq` containing all elements but the first of a `seq`able.',
  body: (seqable) => seq(seqable).rest() || empty_seq
});

let is_empty = defn({
  name: 'is_empty',
  doc: 'Tells if a seqable is empty.',
  pre: [is_seqable],
  body: (seqable) => rest(seq(seqable)) === empty_seq
});

//////////////////// Generators
// These conceptually belong with seqs, and some must be in `prelude`
// But they also have complex signatures that require more robust
// predicates to validate.

// generate: a handy wrapper for a generator function
// returns a lazy iterator over the generator
// TODO: add splats and `recur` to this to allow more robust generation

let lazy = defn({
  name: 'lazy',
  doc: 'Creates a lazy sequence. It takes an initial value, a `step` function, and a `done` function. The `step` function should return the series of values, either by taking the `init` value, or the previous value. `done` should return `true` once the sequence should terminate.',
  body: (init, step, done) => create_seq((function*() {
    let value = init;
    while(!done(value)) {
      yield value;
      value = step(value);
    }
  })())
});

// should be moved to `core`
let range = defn({
  name: 'range',
  doc: 'Creates a sequence of numbers, in order. With one argument, it counts up from 0 to the maximum (exclusive) in steps of +1. With two arguments, it counts up from the start to the max in steps of +1. With three, it counts up to max from start, in steps of whatever you give it.',
  pre: [/*...*/],
  body: [
    (max) => range(0, max, 1),
    (start, max) => range(start, max, 1),
    (start, max, step) => {
      let span = max - start;
      let seq_size = Math.ceil(span / step);
      let sequence = lazy(start, x => x + step, x => x >= max)
      sequence.size = seq_size;
      return sequence;
    }
  ]
});

let cycle = defn({
  name: 'cycle',
  doc: 'Creates a lazy, possibly infinite, sequence of values created by cycling through the members of a sequence. E.g., `cycle([1, 2, 3]); //=> 1, 2, 3, 1, 2, 3, 1, 2, ...`. The optional second argument specifies the number of times to cycle before ending.',
  pre: [/*...*/],
  body: [
    (seqable) => create_seq((function*() {
      while(true) { yield* seq(seqable); }
    })(), Infinity),
    (seqable, count) => {
      let seq_size = size(seqable);
      let cycle_size = is_some(seq_size) ? count * seq_size : undefined;
      return create_seq((function*() {
        let iter = 0;
        while(iter < count) {
          yield* seq(seqable);
          iter += 1;
        }
      })(), cycle_size);
    }
  ]
});

// interleaves seqs
// given a list of seqs, produce a seq that's the first element
// from each, then the second, until one of them is empty
let interleave = defn({
  name: 'interleave',
  doc: 'Given a list of seqables, produce a `seq` that is generated by taking the first element of each, then the second, until one of them is empty. E.g., `inteleave([1, 2], \'ab\'); //=> Seq( 1, a, 2, b )`.',
  body: (...seqables) => {
    let seq_size = Math.min(...seqables.map(size)) * size(seqables);
    let seqs = seqables.map(seq);
    let sequence = create_seq((function*() {
      while(true) {
        if (seqs.some(is_empty)) return;
        let firsts = seqs.map(first);
        yield* firsts;
        seqs = seqs.map(rest);
      }
    })());
    sequence.size = seq_size;
    return sequence;
  }
});

let repeatedly = defn({
  name: 'repeatedly',
  doc: 'Produces a possibly infinite `seq` that is just the same value, repeated over and over again. The optional second argument is the number of times to repeat it. E.g., `repeatedly(\'foo\', 4); //=> Seq( \'foo\', \'foo\', \'foo\', \'foo\' )`.',
  body: [
    (value) => {
      let sequence = lazy(value, (x) => x, () => false);
      sequence.size = Infinity;
      return sequence;
    },
    (value, count) => {
      let sequence = create_seq((function*() {
        let iter = 0;
        while(iter < count) {
          yield value;
          iter += 1;
        }
      })());
      sequence.size = count;
      return sequence;
    }
  ]
});

export {seq, empty_seq, 
  is_seq, is_seqable, is_empty, 
  first, rest, concat, size};