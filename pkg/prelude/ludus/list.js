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

// TODO: Rewrite this in Ludus.

import '../signed/mod.js';

let list_t = type({name: 'List'});

let is_list = fn({
  name: 'is_list',
  doc: 'Tells if something is a list.',
  body: is(list_t)
});

let iterate = fn({
  name: 'iterate',
  doc: 'Iterates through a List.',
  pre: args([is_list]),
  body: (list) => Lazy.gen(list, rest, is_empty, first)
});

let empty_list = create(list_t, {size: 0});

let empty = fn({
  name: 'empty',
  doc: 'Returns an empty list.',
  body: () => empty_list
});

let is_empty = fn({
  name: 'is_empty',
  doc: 'Tells if a list is empty.',
  body: is_identical(empty_list)
});


let cons = fn({
  name: 'cons',
  doc: 'Adds a value to a list, value first. This is the classical lisp way, and included for historical reasons. Short for "construct".',
  pre: args([is_any], [is_any, is_list]),
  body: [
    (x) => cons(x, empty_list),
    (x, list) => create(list_t, {first: x, rest: list, size: list.size + 1})
  ] 
});

let conj = fn({
  name: 'conj',
  doc: 'Adds a value to a list, list first. `conj` is thus a reducer, and is the Ludus-preferred way. Short for "conjoin".',
  pre: args([], [is_any], [is_list, is_any]),
  body: [
    () => empty(),
    (value) => cons(value),
    (list, x) => create(list_t, {first: x, rest: list, size: list.size + 1})
  ]
});

let conj_ = (list, el) => 
  create(list_t, {first: el, rest: list, size: list.size + 1});

let from = fn({
  name: 'from',
  doc: 'Creates a list from an iterable.',
  pre: args([is_iter]),
  body: (xs) => when(is_list(xs)) ? xs : list(...xs)
});

let list = fn({
  name: 'list',
  doc: 'Creates a list of the arguments, in order. E.g., `list(1, 2, 3); //=> ( 1, 2, 3 )`.',
  body: (...elements) => Arr.reduce_right(conj_, empty_list, elements)
});

let first = fn({
  name: 'first',
  doc: 'Returns the first element of a list.',
  pre: args([is_list]),
  body: get('first')
});

let car = fn({
  name: 'car',
  doc: 'Returns the first element of a list. This is the classical lisp name for this operation. Short for "contents of the address register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `first`.',
  pre: args([is_list]),
  body: get('first')
});

let rest = fn({
  name: 'rest',
  doc: 'Returns the contents of a list, excepting the first element, e.g. `rest(list(1, 2, 3)); //=> ( 2, 3 )`.',
  pre: args([is_list]),
  body: (list) => get('rest', list, empty_list)
});

let cdr = fn({
  name: 'cdr',
  doc: 'Returns the contents of a list, excepting the first element, e.g. `cdr(list(1, 2, 3)); //=> ( 2, 3 )`. This is the classical lisp name for this operation. Short for "contents of the decrement register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `rest`.',
  pre: args([is_list]),
  body: (list) => get('rest', list, empty_list)
});

let show_ = fn({
  name: 'show',
  doc: 'Shows a list',
  pre: args([is_list]),
  body: (list) => when(is_empty(list))
    ? '()'
    : `( ${Str.from(into([], map(show), list), ', ')} )`
});

let concat_ = fn({
  name: 'concat',
  doc: 'Concatenates lists (or any iterable).',
  pre: args([], [is_iter]),
  body: [
    () => empty(),
    (xs) => from(xs),
    (xs, ys, ...more) => from(concat(seq(xs), ys, ...more))
  ]
});

export default ns({
  type: list_t, 
  members: {
    show: show_, empty, iterate,
    cons, car, cdr,
    conj, first, rest, list, is_list, from, concat: concat_
}});
