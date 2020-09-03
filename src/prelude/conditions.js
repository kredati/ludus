//////////////////// Conditions and conditionals
// Ludus follows Lisp protocol: the only falsy values are
// `false` and nil, or in this case, `false`, and `null`, and `undefined`.

// boolean :: any -> boolean
// boolean coerces any Ludus value to a boolean,
// according to the Lispish algorithm above
let boolean = x => x == undefined || x === false ? false : true;

// when :: any -> boolean
// when is identical to `boolean`, as above, but is
// a different function for Ludus conditional syntax:
// when ($expr) ? $if_true_expr : $if_false_expr
// The idea is that ternaries are _only_ allowed after a `when` call.
let when = x => x == undefined || x === false ? false : true;

export {when, boolean};