// prototype-based polymorphism
// uses & mungs constructors to convert to a parallel inheritance chain
// This will mean getting careful about inheritance, figuring out if there's a plausible single-chain inheritance diagram for the types I need, etc.
// This will also likely mean setting up an additional system of defining new types.
// Both of these are already done, although what's here is only the bare bones.
// in other words, this is a proof of concept, not a fully worked out inheritance hierarchy
// That said, the dispatch system, as long as it presumes an abstraction to be followed elsewhere, will be able to be separate from designing the concrete inheritance diagram.
// And *that* said, if it is possible, it is worth being sure that the Ludus system for declaring and implementing types/dispatch is robust enough that it can be what I use to build out the inheritance hierarchy in the first place.
// Also: multimethods should, as in clojure, allow functional testing for dispatch, as is currently outlined in poly.js. (In other words, `multi` should be variadic, using n_ary in fn.js.)
// Finally, there are speed issues here. I think it's not necessary to worry about them (yet), but it may be necessary.

///BUT BUT BUT
// Clojure's multimethods don't actually do the whole inheritance chain thing: the lookup is functional. So the functional dispatch _is_ the core of the multimethod.
// AND, type is actually super easy to write: `x => x === null ? null : x.constructor;` (since null can be a key in a `Map`).
// That ensures that you can dispatch super easily on type, but not worry about
// inheritance problems.
// There is still the question of creating new types, but that itself
// can be a fully separate problem from dispatch.


let derive = (obj_name, proto) => globalThis.Object.create(proto, {[name]: {value: obj_name}});
let create = (the_type, obj) => globalThis.Object.assign(globalThis.Object.create({constructor: {[type]: the_type}}), obj);
let name = globalThis.Symbol.for('ludus/name');
let type = globalThis.Symbol.for('ludus/type');

let Any = derive('Any', null);
Any[type] = type;
Any.constructor = Any;
Any.show = function() { return this[name]; };

let Null = derive('Null', Any);

let Value = derive('Value', Any);

let Atom = derive('Atom', Value);

let Boolean = derive('Boolean', Atom);
let Number = derive('Number', Atom);
let Symbol = derive('Symbol', Atom);

let Coll = derive('Coll', Value);

let Object = derive('Object', Coll);
let Record = derive('Record', Object);

let Seq = derive('Seq', Coll);

let Array = derive('Array', Seq);
let Set = derive('Set', Seq);
let Map = derive('Map', Seq);
let String = derive('String', Seq);

let Function = derive('Function', Value);

globalThis.Boolean[type] = Boolean;
globalThis.Number[type] = Number;
globalThis.Symbol[type] = Symbol;
globalThis.Object[type] = Object;
globalThis.Array[type] = Array;
globalThis.String[type] = String;
globalThis.Set[type] = Set;
globalThis.Map[type] = Map;
globalThis.Function[type] = Function;

let type_of = x => x == null ? Null : x.constructor[type];

let rename = (name, obj) => globalThis.Object.defineProperty(obj, 'name', {value: name});

let method_missing = method => value => { 
  throw Error(`${method} missing for ${value} : ${type_of(value)[name]}`) 
};

let multi = (name) => {
  let method = globalThis.Symbol(name);

  let dispatch = (value, ...args) => (type_of(value)[method] || method_missing(name))(value, ...args);

  dispatch.method = method;

  return rename(name, dispatch);
}

let method = (method, type, fn) => {
  type[method.method] = rename(method.name, fn);
  return fn;
}

let foo = multi('foo'); 

let strfoo = method(foo, String, (x, ...args) => `foo and ${x} and ${args.join('&')}`); //=
method(foo, Number, () => 'number foo');
method(foo, Any, () => 'foo')

foo('x') //=
foo(3) //=
foo() //=

let Myseq = derive('Myseq', Seq)
let myseq = create(Myseq, {foo: 'bar'});
myseq.foo //=
foo(myseq) //=

let bar = multi('bar');
method(bar, Seq, () => 'bar');
method(bar, Any, () => 'any bar');

bar('') //=
bar(); //=