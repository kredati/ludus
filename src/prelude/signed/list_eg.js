import Ludus from './deps.js';

let {NS, Type} = Ludus;

let {create, deftype} = Type;

let List = deftype({name: 'List'});

let empty = create(List, {size: 0});

let cons = (first, rest = empty) => create(List, {first, rest, size: rest.size + 1});

let first = (list) => list.first;

let rest = (list) => list.rest;

let iterate = (list) => function* () {
  while (list.first) {
    yield list.first;
    list = list.rest;
  }
};

let conj = (rest, first) => cons(first, rest);

let list = (...xs) => xs.reduceRight(conj, empty);

let show = (list) => `(${[...list].join(', ')})`;

let is_list = (x) => Type.is(List, x);

let is_empty = (x) => x === empty;

export default NS.defns({name: 'List', type: List, members: {
  List, empty, cons, first, rest, iterate, conj, list, show, is_list, is_empty 
}});

list(1, 2, 3) //?
