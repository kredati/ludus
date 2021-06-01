import Fn from './fns.js';
import NS from './ns.js';

let {defmethod} = Fn;
let {ns} = NS;

let assoc = defmethod({
    name: 'assoc'
});

let conj = defmethod({
    name: 'conj'
});

let empty = defmethod({
    name: 'empty'
});

let index_of = defmethod({
    name: 'index_of'
});

let slice = defmethod({
    name: 'slice'
});

let and = defmethod({
    name: 'and'
});

let or = defmethod({
    name: 'or'
});

let not = defmethod({
    name: 'not'
});

let update = defmethod({
    name: 'update'
});

let concat = defmethod({
    name: 'concat'
});

export default ns({
    name: 'Mthd',
    members: {
        assoc, conj, empty, index_of, slice, and, or, not, update, concat
    }
});