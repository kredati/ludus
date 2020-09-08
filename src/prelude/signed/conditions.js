//////////////////// Conditions and conditionals

import L from './deps.js';
import F from './fns.js';
import P from './preds.js';

let {ns} = L;
let {defn} = F;
let {bool} = P;

let when = defn({
  name: 'when',
  doc: '`when` is the core conditional form of Ludus. It is like a normal function (and the function part behaves exactly as `bool`), but it must be followed by two conditional expressions: `when({condition}) ? {if_true} : {if_false}`. Unlike other Ludus conditional forms, the `{if_true}` and `{if_false}` expressions are only executed when the condition passed to `when` is, respectively, `truthy` and `falsy`.',
  body: x => x == undefined || x === false ? false : true
});

let cond = defn({
  name: 'cond',
  doc: '`cond` takes value and a series of clauses (at least one). Each clause is an array of two items, a predicate function and an executive function. If the predicate returns a truthy value when passed to the predicate, the executive function is called with the predicate. Note that both predicate and executive functions must be unary. E.g. `cond(1, [eq(0), inc(1)], [eq(1), inc(2)]); //=> 3`.',
  body: (value, ...clauses) => {
    for (let [pred, exec] of clauses) {
      if (bool(pred(value))) return exec(value);
    }
    return undefined;
  }
});

let Cond = ns({
  name: 'Cond',
  space: {
    when,
    cond
  }
})