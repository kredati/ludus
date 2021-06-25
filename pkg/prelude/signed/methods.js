import Fn from './fns.js';
import NS from './ns.js';
import Bool from './bools.js';

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
    name: 'and',
    not_found: Bool.and
});

let or = method({
    name: 'or',
    not_found: Bool.or
});

let not = method({
    name: 'not',
    not_found: Bool.not
});

let update = method({
    name: 'update'
});

let concat = method({
    name: 'concat'
});

let maybe = method({
    name: 'maybe'
});

export default ns({
    name: 'Mthd',
    members: {
        assoc, conj, empty, index_of, slice, and, or, not, update, concat, maybe
    }
});