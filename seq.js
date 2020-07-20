// some thoughts
// a seq is going to have to be an object to conform to the JS iterator protocol
// the functions that operate on seqs will then be calls to methods
// `first` on a given seq will always have to return the same value
// `rest` on a given seq will (a) always be lazily generated
// and (b) return another seq or a special end object
// each will have an iterator that then traverses the first value and then the subsequent seq
// in many ways, this will look almost exactly like a linked list
// the most challenging case will be for objects, I reckon
// that said, it will be very helpful indeed to get this to work across an iterator/generator protocol in JS--a goal that I don't know whether that's possible
// as a way of understanding how this might be tractable:
// write this as imperatively as necessary for arrays--likely without generators--and then generalize
// it's possible that the way to do this is to make a generator-generator, yield*ing, but I can't work that out in my head
// keep in mind the most important things:
// - no mutation, or abstracting the mutation away
// - thunks are helpful!
// - every operation needs to be O(1)
// - it doesn't matter if it's ugly to abstract across a weird & heterogeneous landscape
// - remember, the operations we need to implement *everything* else are:
// *** seq functions
// * first
// * rest
// * cons/conj
// *** coll functions
// * count
// * empty?
// * every? (this is O(n) and can be implemented in terms of first/rest)
// also, it's going to be very helpful to figure out how to get this to work across generators, if only because things like `range` or `repeatedly` are best implemented as generators (although they do not have to be, I don't think).

let value_generator = value => function* () {
  while (true) {
    yield value;
  }
}

let iterable_generator = function* (arr) {
  for (let el of arr) {
    yield el;
  }
}

let object_generator = function* (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) yield [key, obj[key]];
  }
}

let nil = {first: null, rest: null};

let end = function* () {
  while (true) {
    yield {
      first: null,
      rest: end()
    };
  }
}

let generator_generator = function* (gen) {
  let next = gen.next(),
    first = boolean(next.value) ? next.value : null,
    rest = next.done ? end() : generator_generator(gen);

  while (true) {
    yield {
      first,
      rest
    };
  }
}

let boolean = x => !(x === false || x == null);

let gen = genable => {
  if (Array.isArray(genable)) return iterable_generator(genable);
  if (genable != null && typeof genable === 'object') return object_generator(genable);
  return iterable_generator(genable);
}

let Seq = function(seqable) {
  this.gen = generator_generator(gen(seqable));
  return this;
}

Seq.prototype = {
  foo () { return 'foo'; },

  first () { 
    return this.gen.next().value.first;
  },

  rest () {
    return this.gen.next().value.rest;
  }
}

let s = new Seq('bar');
s.foo() //=
s.first()
s.rest() //=

let seq = seqable => {} 

let first = seq => seq.next().value.first;
let rest = seq => seq.next().value.rest;
let is_empty = seq => first(seq) === null;

let show = (seq, str = '(') => !is_empty(seq) 
  ? show(rest(seq), str + first(seq) + ' : ') 
  : str + ')'

let arr = new Set([1, 1, 1, 2, 2, 3]);
let arrgen = iterable_generator(arr);
let iter = generator_generator(arrgen);

show(iter) //=

let obj = {a: 1, b: 2, c: 3};
let objgen = object_generator(obj);
iter = generator_generator(objgen); 

