// prototype-based polymorphism
// probably I'll need an inheritance chain that is separate from the JS mess
// the idea is for multimethods to install themselves on this prototype chain
// that way I'm not munging with the weird JS inheritance stuff (is [] instanceof Array? And instanceof Object is kind of a mess. And so are the atomic types.)
// (I may revise this if it turns out performance is an issue.)
// The idea is that multimethods install a method on the prototype, and dispatch using the prototype chain.
// I need a function that calls one of these methods (think `$call`). Basically, I need a functional abstraction over method calls. (I can even avoid `this` here, since every function will be stateless. That said, the API will be such that the instance of the datatype it's called on is passed as the *first* argument to the pure function.)
// I think this is enough to get multimethods using prototypes in addition to/in place of functional tests. (Functional tests, as currently already exist in multi.js, should be optional!--since they allow for simpler, if slower, dispatch, that responds to the shape of the data rather than its type.)
// This will mean getting careful about inheritance, figuring out if there's a plausible single-chain inheritance diagram for the types I need, etc.
// This will also likely mean setting up an additional system of defining new types.
// That said, the dispatch system, as long as it presumes an abstraction to be followed elsewhere, will be able to be separate from designing the concrete inheritance diagram.
// And *that* said, if it is possible, it is worth being sure that the Ludus system for declaring and implementing types/dispatch is robust enough that it can be what I use to build out the inheritance hierarchy in the first place.

// this is a proof of concept, not a fully worked out inheritance hierarchy

let derive = (obj_name, proto) => globalThis.Object.create(proto, {[name]: {value: obj_name}});
let create = (the_type, obj) => ({...obj, constructor: {[type]: the_type}});
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

let method_missing = (method) => (value) => { throw Error(`${method} missing for ${value} : ${type_of(value)[name]}`) };

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
bar() //=
