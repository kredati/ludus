// here's something that I want to be able to do in, e.g. list or vector

let is_nil = x => x == null;

let list_tag = Symbol('list');

let end = {value: null, ['ludus/type']: list_tag};
let empty = () => null;
let cons = (value, next = null) => ({value, next, ['ludus/type']: list_tag});
let conj = (next, value) => cons(value, next);
let first = (list) => list.value;
let rest = (list) => list.next;
let list = (...args) => args.reduceRight(conj, end);
let show = (list, str = '(') => rest(list) 
  ? show(rest(list), str + ' ' + first(list))
  : str + ' )';
let count = (list, acc = 0) => rest(list) ? count(rest(list), acc + 1) : acc;

count(list(1, 2, 3, 'foo', null, 'bar')) //=

