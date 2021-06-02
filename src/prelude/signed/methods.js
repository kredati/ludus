import Fn from './fns.js';
import NS from './ns.js';

let {method} = Fn;
let {ns} = NS;

let assoc = method({
    name: 'assoc'
});

let conj = method({
    name: 'conj'
});

let empty = method({
    name: 'empty'
});

let index_of = method({
    name: 'index_of'
});

let slice = method({
    name: 'slice'
});

let and = method({
    name: 'and'
});

let or = method({
    name: 'or'
});

let not = method({
    name: 'not'
});

let update = method({
    name: 'update'
});

let concat = method({
    name: 'concat'
});

export default ns({
    name: 'Mthd',
    members: {
        assoc, conj, empty, index_of, slice, and, or, not, update, concat
    }
});