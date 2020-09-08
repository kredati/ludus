//////////////////// Values, or doing stuff with things
// The functions collected here are a complete set of
// functions that replace infix operations in JS

// TODO: consider changing arity dispatching to Clj's scheme:
// * nullary produces the identity value for the function
//   ^ e.g, 0 for `add,` '' for `string`, `true` for `and`, etc.
// * unary is the identity function
// * binary and higher apply the function to the arguments in a
//    reasonable order
// This is elegant mathematically, but requires users to handle
// partial application of functions on their own, which might be
// difficult or annoying. And using these functions may be an excellent
// way to introduce users to partial application.
// That 

import L from './deps.js';
import P from './preds.js';
import F from './fns.js';

let {sign, partial, splat} = L;
let {defn} = F;
let {bool, is_string, is_number, is_int} = P;

///// Booleans
let not = defn({
  name: 'not',
  doc: 'Boolean `not` (`!`) of a value. Deals in truthy and false, not literal `true` or `false`. E.g., `not(3) //=> false`.',
  body: (x) => !bool(x)
});

let and = defn({
  name: 'and',
  doc: 'Boolean `and` (`&&`) of values. With one argument, returns a function that is the `and` of its arguments with the original value. With two or more arguments, `and`s all the arguments. If an argument returns falsy (`undefined` or `false`), returns that value, and does not proceed further. Otherwise it returns the last value. Deals in truthy and falsy, not literal `true` or `false`. Short circuits on the first falsy value, but since all arguments are evaluated before being passed to `and`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(and, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      for (let x of xs) {
        if (not(x)) return x;
      }
      return xs[xs.length - 1];
    }
  ]
});

let or = defn({
  name: 'or',
  doc: 'Boolean `or` (`||`) of values. With one argument, returns a function that is the `or` of its arguments with the original value. With two or more arguments, `or`s all the arguments. Returns the first truthy value. If all values are falsy (`undefined` or `false`), returns the last argument. Deals in truthy and falsy, not literal `true` and `false`. Short-circuits on the first truthy value, but since all arguments are evaluted before being passed to `or`, all arguments are indeed evaluated.',
  body: [
    (x) => partial(or, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      for (let x of xs) {
        if (bool(x)) return x;
      }
      return xs[xs.length - 1];
    }
  ]
});

let Bool = L.ns({
  name: 'Bool',
  space: { not, and, or }
});

///// Numbers
// Arithmetic, random numbers, etc.
let add = defn({
  name: 'add',
  doc: 'Adds numbers. With two or more arguments, sums all the arguments together. With one argument, partially applies `add`, returning a function that will add that will sum all its arguments, and then add the first. E.g., `add(1, 2, 3); //=> 6`, and `add(1)(2); //=> 3`.',
  pre: splat(is_number),
  body: [
    (x) => partial(add, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      let sum = 0;
      for (let x of xs) {
        sum += x;
      }
      return sum;
    }
  ]
});

let mult = defn({
  name: 'mult',
  doc: 'Multiplies numbers. With two or more arguments, multiplies all the arguments together. With one argument, partially applies `mult`, returning a function that will multiply all its arguments, and then multiply that product by the first. E.g., `mult(2, 3, 4); //=> 24` and `mult(2)(4); //=> 8`.',
  pre: splat(is_number),
  body: [
    (x) => partial(mult, x),
    (x, y, ...more) => {
      let xs = [x, y, ...more];
      let product = 1;
      for (let x of xs) {
        product *= x;
      }
      return product;
    }
  ]
});

let sub = defn({
  name: 'sub',
  doc: 'Subtracts numbers. With two arguments, subtracts the second from the first. E.g. `sub(10, 4); //=> 6`. With three or more arguments, subtracts from the first argument the sum of the remaining arguments. E.g., `sub(10, 2,3); //=> 5`. With a single argument, returns `sub` partially applied, which will subtract the sum of any arguments from the original first argument. E.g. `sub(10)(1, 2, 3); //=> 4`. Note that this is perhaps unintuitive behavior. If you want a function that will subtract a given amount from its argument, see `sub_by`.',
  pre: splat(is_number),
  body: [
    (x) => partial(sub, x),
    (x, y) => x - y,
    (x, y, z, ...more) => {
      let ys = [y, z, ...more];
      return sub(x, add(...ys));
    }
  ]
});

let sub_by = defn({
  name: 'sub_by',
  doc: 'Takes a number and returns a unary function that subtracts that first number from its argument, e.g. `sub_by(3)(10); //=> 7`.',
  pre: sign([is_number]),
  body: (x) => defn({
    name: `sub(${x})`,
    pre: sign([is_number]),
    body: (y) => y - x
  })
});

let is_nonzero = defn({
  name: 'is_nonzero',
  doc: 'Tells if a number is not zero. Returns false given non-numbers.',
  body: (x) => is_number(x) && x !== 0
});

let div = defn({
  name: 'div',
  doc: 'Divides numbers. Given two arguments, divides the first by the second. Given three arguments, divides the first by the product of the remaining. Given a single argument, returns `div` partially applied, dividing that first argument by the product of any additional arguments. E.g. `div(1/2); //=> 0.5`, `div(12, 2, 3); //=> 2`, `div(24)(2, 4); //=> 3`. Throws an error on attempts to divide by zero (i.e. if any arguments but the first are `0`). If you want a function to divide by a particular number, see `div_by`.',
  pre: sign([is_number], [is_number, is_nonzero]),
  body: [
    (x) => partial(div, x),
    (x, y) => x / y,
    (x, y, z, ...more) => {
      let ys = [y, z, ...more];
      return div(x, mult(...ys));
    }
  ]
});

let div_by = defn({
  name: 'div_by',
  doc: 'Given a number, returns a unary function that divides its argument by the original number. E.g. `div_by(2)(10); //=> 5`. Throws an error on attempts to divide by zero (the argument to `div_by` cannot be `0`).',
  pre: sign([is_nonzero]),
  body: (x) => defn({
    name: `div_by(${x})`,
    pre: sign([is_number]),
    body: (y) => y / x
  })
});

let random = defn({
  name: 'random',
  doc: 'Returns a (pseudo)random number. With zero arguments, returns a random number between 0 (inclusive) and 1 (exclusive). Given one argument, returns a random number between 0 (inclusive) and its argument (exclusive). Given two arguments, returns a random number between them (inclusive of the first, exclusive of the second).',
  pre: sign([], [is_number], [is_number, is_number]),
  body: [
    () => Math.random(),
    (x) => Math.random() * x,
    (x, y) => (Math.random() * (y - x)) + x
  ]
});

let ceil = defn({
  name: 'ceil',
  doc: 'Ceiling function: rounds up to the next integer, returning integers unchanged. E.g. `ceil(3.1); //=> 4`. The ceiling of negative numbers still rounds "up," i.e. towards zero: `ceil(-2.3); //=> -2`.',
  pre: sign([is_number]),
  body: (x) => Math.ceil(x)
});

let floor = defn({
  name: 'floor',
  doc: 'Floor function: rounds down to the next integer, returning integers unchanged. E.g. `floor(3.1); //=> 3`. The `floor` of negative numbers still rounds "down," i.e. away from zero: `floor(-2.3); //=> -3`. Compare to `trunc`.',
  pre: sign([is_number]),
  body: (x) => Math.floor(x)
});

let trunc = defn({
  name: 'trunc',
  doc: 'Truncates the decimal portions of a number, returning integers unchanged. E.g. `trunc(3.1); //=> 3`. The `trunc` of negative numbers rounds "up," towards `0`: `trunc(-3.1); //=> -3`. Compare to `floor`.',
  pre: sign([is_number]),
  body: (x) => x | 0
});

let round = defn({
  name: 'round',
  doc: 'Rounds numbers to the nearest integer. It returns integers unchanged. In most cases, it rounds positive and negative numbers as you would expect, i.e. `round(3.3); //=> 3` and `round(-3.3); //=> -3`. However, arguments with a fractional portion of `0.5` are always rounded "up," in the direction of positive infinity: `round(3.5); //=> 4` but `round(-3.5); //=> -3`.',
  pre: sign([is_number]),
  body: (x) => Math.round(x)
});

let abs = defn({
  name: 'abs',
  doc: 'Absolute value of a number: how far away from `0` it is on the number line.',
  pre: sign([is_number]),
  body: (x) => Math.abs(x)
});

let random_int = defn({
  name: 'random_int',
  doc: 'Returns a random integer. Given one argument, returns a random integer between `0` (inclusive) and that value (exclusive). Given two arguments, returns a random integer between them (inclusive of the first argument, exclusive of the second argument). Arguments must be integers. E.g. `random_int(3); //=> 0, 1, or 2` and `random_int(1, 4); //=> 1, 2, or 3`.',
  pre: sign([is_int], [is_int, is_int]),
  body: [
    (x) => (Math.random() * x) | 0,
    (x, y) => ((Math.random() * (y - x)) | 0) + x 
  ]
});

let mod = defn({
  name: 'mod',
  doc: 'Modulus operation, or the remainder. Returns the remainder when the first argument is divided by the second. Second argument must not be `0`.',
  pre: sign([is_number, is_nonzero]),
  body: (x, y) => x % y
});

let pow = defn({
  name: 'pow',
  doc: 'Exponentiation operation. When given two numbers, raises the first argument to the second. When given three or more numbers, raises the first to the second, and then raises the result of that to the third, and so on. When given one number, returns `pow` partially applied: a function that raises that first number to the power of the argument, e.g. `pow(2)(4); //=> 16`. If you want a function that raises its argument to the power of a particular number, see `pow_by`.',
  pre: sign([is_number], [is_number, is_number]),
  body: [
    (x) => partial(pow, x),
    (x, y, ...more) => {
      let ys = [y, ...more];
      for (let y of ys) {
        x = x ** y;
      }
      return x;
    },
  ]
});

let pow_by = defn({
  name: 'pow_by',
  doc: 'Takes a number argument `x`, and returns a function that raises its argument to the power of `x`, e.g. `pow_by(2)` squares numbers, `pow_by(3)` cubes them, and so on.',
  pre: sign([is_number]),
  body: (x) => defn({
    name: `pow_by(${x})`,
    pre: sign([is_number]),
    body: (y) => y ** x
  })
});

let gt = defn({
  name: 'gt',
  doc: 'Greater than comparator, `>`. When given two numbers, returns `true` if the first is greater than the second. When given three or more numbers, returns `true` if the numbers are in decreasing order. When given one number, `gt` returns itself partially applied. Note that this might be counterintuitive, `gt(3)` is not "greater than 3" but "is 3 greater than?"',
  pre: splat(is_number),
  body: [
    (x) => partial(gt, x),
    (x, y, ...more) => {
      let ys = [y, ...more];
      let prev = x;
      for (let y of ys) {
        if (!(prev > y)) return false;
        prev = y;
      }
      return true;
    }
  ]
});

let gte = defn({
  name: 'gte',
  doc: 'Greater than or equal comparator, `>=`. With one argument, partially applies itself. With two, returns `true` if the first is greater than or equal to the second. With three or more, returns `true` if the numbers are in decreasing or flat order, e.g. `gte(3, 2, 1, 1, 1); //=> true`. Note that partial application may be counterintuitive, `gte(3)` is not "is x greater than or equal to 3?" but "is 3 greater than or equal to x?"',
  pre: splat(is_number),
  body: [
    (x) => partial(gt, x),
    (x, y, ...more) => {
      let ys = [y, ...more];
      let prev = x;
      for (let y of ys) {
        if (!(prev >= y)) return false;
        prev = y;
      }
      return true;
    }
  ]
});

let lt = defn({
  name: 'lt',
  doc: 'Less than comparator, `<`. With one argument, partially applies itself. With two, returns `true` if the first is less than the second. With three or more, returns `true` if the numbers are in increasing order. Note that partial application may be counterintuitive, `lt(3)` is not "is x less than 3?" but "is 3 less than x?"',
  pre: sign([is_number], [is_number, is_number]),
  body: [
    (x) => partial(lt, x),
    (x, y) => x < y
  ]
});

let lte = defn({
  name: 'lte',
  doc: 'Less than or equal to comparator, `<=`. With one argument, partially applies itself. With two, returns `true` if the first is less than or equal to the second. With three, returns `true` if the numbers are in increasing or flat order, e.g. `lte(1, 2, 3, 3); //=> true`. Note that partial application may be counterintuitive, `lte(3)` is not "is x less than or equal to 3?" but "is 3 less than or equal to x?"',
  pre: sign([is_number], [is_number, is_number]),
  body: [
    (x) => partial(lte, x),
    (x, y) => x <= y
  ]
});

let is_positive = defn({
  name: 'is_positive',
  doc: 'Tells if a number is positive, i.e. greater than `0`. Note that `0` is not itself positive. Returns `false` for non-numbers.',
  body: (x) => typeof x === 'number' && x > 0
});

let is_positive_int = defn({
  name: 'is_positive_int',
  doc: 'Tells if a number is a positive integer, i.e. an integer greater than `0`. Returns `false` for non-numbers.',
  body: (x) => typeof x === 'number' && x > 0 && (x | 0) === x
});

let is_natural = defn({
  name: 'is_natural',
  doc: 'Tells if a number is a "natural number": integers greater than or equal to `0`. Returns `false` for non-numbers.',
  body: (x) => typeof x === 'number' && x >= 0 && (x | 0) === x
});

let is_negative = defn({
  name: 'is_negative',
  doc: 'Tells if a number is less than zero. Returns `false` for non-numbers.',
  body: (x) => typeof x === 'number' && x < 0
});

let sqrt = defn({
  name: 'sqrt',
  doc: 'Takes the square root of a positive number.',
  pre: sign([is_positive]),
  body: (x) => Math.sqrt(x)
});

let sum_of_squares = defn({
  name: 'sum_of_squares',
  doc: 'Returns the sum of the squares of the numbers passed in. To compare the magnitude of vectors quickly, use `sum_of_squares`: it avoids the costly `sqrt` step in `hypot`.',
  pre: splat([is_number]),
  body: (...xs) => add(...xs.map(x => x ** 2))
});

sum_of_squares //?

let hypot = defn({
  name: 'hypot',
  doc: 'Returns the "hypoteneuse" of a list of numbers: the square root of the sum of their squares. Note that this can be slow, and to compare, e.g. the magnitude of vectors, you should probably use `sum_of_squares`.',
  pre: splat([is_number]),
  body: (...xs) => Math.hypot(...xs)
});

hypot 

let number = defn({
  name: 'number',
  doc: 'Attempts to produce a number from another type. Numbers pass through unharmed. `false` is `0`, `true` is `1`; strings are parsed, and, if they look enough like a number that JS thinks it knows what to do with them, you get a number back. Bigints are coerced if they are small enough. Anything else returns `undefined`.',
  body: (x) => {
    let number = Number(x);
    if (isNaN(number)) return undefined;
    return number;
  }
});

///// Strings
// String manipulations, excepting regexes because ugh regexes

let concat = defn({
  name: 'concat',
  doc: 'Concatenates strings togheter, returning a new string made up of each argument in order.',
  pre: splat(is_string),
  body: [
    () => '',
    (x) => x,
    (x, y) => x + y,
    (x, y, z, ...more) => x.concat(y, z, ...more)
  ]
});

let string = defn({
  name: 'string',
  doc: 'Produces a quick and dirty string representation of any arguments it is given, concatenating the resulting strings. It returns strings unharmed. With zero arguments, it returns the empty string. Note that these string representations dispatch to JS\'s `toString` method on a value, which may not produce lovely or especially informative results: `string({}); //=> \'[object Object]\'` and `string([1, 2, 3]); //=> \'1,2,3\'`. For prettier (and slower) output, see `show`.',
  body: [
    () => '',
    (x) => x.toString(),
    (x, y, ...more) => {
      let xs_str = [x, y, ...more].map(x => x.toString());
      return ''.concat(...xs_str);
    }
  ]
});

let split = defn({
  name: 'split',
  doc: 'Splits a string into substrings, using a separator that is also a string. Returns an array of strings. With one argument, returns a function that splits strings using the argument as a separator. With two arguments, splits the second string using the first as the separator.',
  pre: sign([is_string], [is_string, is_string]),
  body: [
    (sep) => partial(split, sep),
    (sep, str) => str.split(sep)
  ]
});

let is_blank = defn({
  name: 'is_blank',
  doc: 'Tells if a string is nothing but whitespace (spaces, newlines, tabs, etc.).',
  pre: sign([is_string]),
  body: (str) => str.trim() === ''
});

let is_empty = defn({
  name: 'is_empty',
  doc: 'Tells if a string is the empty string.',
  pre: sign([is_string]),
  body: (str) => str === ''
});

let trim = defn({
  name: 'trim',
  doc: 'Trims all preceding and trailing whitespace from a string. E.g., `trim(\'    foo  \'); //=>  \'foo\'`.',
  pre: sign([is_string]),
  body: (str) => str.trim()
});

let trim_left = defn({
  name: 'trim_left',
  doc: 'Trims whitespace from the beginning of a string.',
  pre: sign([is_string]),
  body: (str) => str.trimStart()
});

let trim_right = defn({
  name: 'trim_right',
  doc: 'Trims whitespace from the end of a string.',
  pre: sign([is_string]),
  body: (str) => str.trimEnd()
});

let index_of;

let last_index_of;

let upcase;

let lowcase;

let words;

let replace;

let replace_first;

let size;

let from_code;

let code_at;

let char_at;

let ends_with;

let includes;

let pad_left;

let pad_right;

let slice;


