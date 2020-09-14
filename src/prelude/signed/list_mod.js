//////////////////// List, a linked list for Ludus
// We *have* to have linked lists; they are so profoundly important
// for Lisp, if only historically.
// This is a fairly straightforward implementation. The list itself
// is bog-standard, with one quirk and one enhancement.
// The enhancement is that it it keeps track of its size to help speed 
// up equality operations.
// The quirk is that in place of `nil` or `undefined` as the list terminator,
// there's a special `empty` list object. This plays much more nicely with
// the underlying Javascript.
// It also comes with a prototype that conforms to the JS iteration
// protocol, and a special inspector that gives us a nice representation
// at the repl.

// TODO: add pre/post conditions for list operations.

import L from './deps.js';
import P from './preds.js';
import F from './fns.js';

let {defn} = F;
let {create, sign} = L;
let {is_any, maybe} = P;

let List = {
  name: 'List',
  get constructor () { return List },
  [Symbol.iterator] () {
    let first = this.first;
    let rest = this.rest;
    return {
      next () {
        let out = first;
        if (out === undefined) return {done: true};
        first = rest.first;
        rest = rest.rest;
        return {value: out};
      }
    }
  },
  [L.custom] () {
    if (this === empty) return `()`;
    return `( ${[...this].map(L.show).join(', ')} )`;
  }
};

let is_list = defn({
  name: 'is_list',
  doc: 'Tells if something is a list.',
  body: (x) => x != undefined && Object.getPrototypeOf(x) === List
});

let empty = create(List, {size: 0});
empty.rest = empty;

let cons = defn({
  name: 'cons',
  doc: 'Adds a value to a list, value first. This is the classical lisp way, and included for historical reasons. Short for "construct".',
  pre: sign([is_any], [is_any, maybe(is_list)]),
  body: (value, list = empty) => 
    create(List, {first: value, rest: list, size: list.size + 1})
});

let conj = defn({
  name: 'conj',
  doc: 'Adds a value to a list, list first. `conj` is thus a reducer, and is the Ludus-preferred way. Short for "conjoin".',
  pre: sign([], [is_any], [is_list, is_any]),
  body: [
    () => empty,
    (value) => cons(value),
    (list, value) => cons(value, list)
  ]
});

let list = defn({
  name: 'list',
  doc: 'Creates a list of the arguments, in order. E.g., `list(1, 2, 3); //=> ( 1, 2, 3 )`.',
  body: (...elements) => elements.reduceRight(conj, empty)
});

let first = defn({
  name: 'first',
  doc: 'Returns the first element of a list.',
  pre: sign([is_list]),
  body: (list) => list.first
});

let car = defn({
  name: 'car',
  doc: 'Returns the first element of a list. This is the classical lisp name for this operation. Short for "contents of the address register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `first`.',
  pre: sign([is_list]),
  body: (list) => list.first
});

let rest = defn({
  name: 'rest',
  doc: 'Returns the contents of a list, excepting the first element, e.g. `rest(list(1, 2, 3)); //=> ( 2, 3 )`.',
  pre: sign([is_list]),
  body: (list) => list.rest
});

let cdr = defn({
  name: 'cdr',
  doc: 'Returns the contents of a list, excepting the first element, e.g. `cdr(list(1, 2, 3)); //=> ( 2, 3 )`. This is the classical lisp name for this operation. Short for "contents of the decrement register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `rest`.',
  pre: sign([is_list]),
  body: (list) => list.rest
});

export {list, cons, car, cdr, conj, empty, first, rest, is_list};