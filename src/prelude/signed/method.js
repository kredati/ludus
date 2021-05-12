//////////////////// Methods
// Methods are functions that dispatch to other functions--with the same name, in other namespaces. 
// Methods are how we achieve polymorphism in Ludus. For example, many different types implement
// a `conj` function: lists, arrays, strings, etc. A `conj` method lets us call the correct `conj`
// for a datatype.

import Arr from './arr.js';
import List from './list.js';
import Str from './strings.js';
import Obj from './objs.js';
import Seq from './seqs.js';
import NS from './ns.js';
import Fn from './fns.js';
import ns from './ns.js';

let {defn} = Fn;

// TODO: spec this
let defmethod = defn({
    name: 'defmethod',
    doc: 'Defines a method.',
    body: ({name, ...attrs}) => defn({
        name, ...attrs, 
        body: (first, ...rest) => NS.get_ns(first)[name](first, ...rest)
    })
});