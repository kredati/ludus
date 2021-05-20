//////////////////// Methods
// Methods are functions that dispatch to other functions--with the same name, in other namespaces. 
// Methods are how we achieve polymorphism in Ludus. For example, many different types implement
// a `conj` function: lists, arrays, strings, etc. A `conj` method lets us call the correct `conj`
// for a datatype.

import Obj from './objs.js';
import P from './preds.js';
import NS from './ns.js';
import Fn from './fns.js';
import Spec from './spec.js';
import N from './nums.js';
import Arr from './arr.js';
import F from './fns.js';

let {defn} = Fn;
let {args, record, string, maybe, any, function: fn, seq, and, defspec} = Spec;
let {partial} = F;

let method_descriptor = record('method_descriptor', {name: string, doc: maybe(string)});

let defmethod = defn({
    name: 'defmethod',
    doc: 'Defines a method.',
    pre: args([method_descriptor]),
    body: ({name, ...attrs}) => defn({
        name, ...attrs, 
        body: (first, ...rest) => NS.get_ns(first)[name](first, ...rest)
    })
});

let has_method = defn({
    name: 'has_method',
    doc: 'Tells if a value has a method associated with it.',
    pre: args([fn], [fn, any]),
    body: [
        (method) => partial(has_method, method),
        (method, value) => P.has(method.name, NS.get_ns(value))
    ]
});

let proto_descriptor = record('proto_descriptor', {name: string, doc: maybe(string), methods: seq(fn)});

let implements_method = defn({
    name: 'implements_method',
    doc: 'Creates a spec that tells if a value has a method associated with it.',
    pre: args([fn]),
    body: (fn) => defspec({name: `implements ${fn.name}`, pred: (x) => has_method(fn, x)})
});

let defproto = defn({
    name: 'defproto',
    doc: 'Defines a protocol.',
    pre: args([proto_descriptor]),
    body: ({name, methods, ...attrs}) => {
        let proto = and(...methods.map((f) => implements_method(f)));
        proto.name = name;
        for (let attr in attrs) proto[attr] = attrs[attr];
        return proto;
    }
});

export default NS.defns({name: 'Method', members: {
    defmethod, has_method, implements_method, defproto
}});