# `Number::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `abs::fn`
`(x)::(is_num)`<br/>
Absolute value of a number: how far away from `0` it is on the number line.

***
#### `acos::fn`
`(x)::(is_in_range<-1, 1>)`<br/>
The inverse of `cos`; takes a number between -1 and 1, inclusive.

***
#### `add::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Adds numbers. With two or more arguments, sums all the arguments together. With one argument, partially applies `add`, returning a function that will add that will sum all its arguments, and then add the first. E.g., `add(1, 2, 3); //=> 6`, and `add(1)(2); //=> 3`.

***
#### `asin::fn`
`(x)::(is_in_range<-1, 1>)`<br/>
The inverse of `sin`; takes a number between -1 and 1, inclusive.

***
#### `atan::fn`
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_num)`<br/>
The arctangent of a slope, returning the angle in radians. With one argument, returns the arctangent of the slope expressed in a ratio. To avoid division by zero at vertical lines, the two-argument versiion takes the numerator and denominator. The two-argument version is much more common in typical use.

***
#### `cbrt::fn`
`(x)::(is_num)`<br/>
Takes the cube root of a number.

***
#### `ceil::fn`
`(x)::(is_num)`<br/>
Ceiling function: rounds up to the next integer, returning integers unchanged. E.g. `ceil(3.1); //=> 4`. The ceiling of negative numbers still rounds "up," i.e. towards zero: `ceil(-2.3); //=> -2`.

***
#### `clamp::fn`
`(max)::(is_num)`<br/>
`(min, max)`<br/>
`(min, max, x)`<br/>
`clamp` constrains the range of a number. With one argument, `max`, it returns a function that clamps its argument between `0` and `max`. With two arguments, `min` and `max`, it returns a function that clamps its argument between `min` and `max`. Given three arguments, `min`, `max`, and `x`, it returns the value of `x` clamped between `min` and `max`.

***
#### `cos::fn`
`(x)::(is_num)`<br/>
The cosine of an angle (in radians).

***
#### `dec::fn`
`(x)::(is_num)`<br/>
Decrements a number by 1.

***
#### `deg_to_rad::fn`
`(...args2)`<br/>
Given an angle measurement in degrees, converts it to radians.

***
#### `div::fn`
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_nonzero)`<br/>
`(x, y, z, ...more)`<br/>
Divides numbers. Given two arguments, divides the first by the second. Given three or more arguments, divides the first by the product of the remaining. Given a single argument, returns `div` partially applied, dividing that first argument by the product of any additional arguments. E.g. `div(1, 2); //=> 0.5`, `div(12, 2, 3); //=> 2`, `div(24)(2, 4); //=> 3`. Raises an error on attempts to divide by zero (i.e. if any arguments but the first are `0`). If you want a function to divide by a particular number, see `div_by`.

***
#### `div_by::fn`
`(x)::(is_nonzero)`<br/>
Given a number, returns a unary function that divides its argument by the original number. E.g. `div_by(2)(10); //=> 5`. Throws an error on attempts to divide by zero (the argument to `div_by` cannot be `0`).

***
#### `floor::fn`
`(x)::(is_num)`<br/>
Floor function: rounds down to the next integer, returning integers unchanged. E.g. `floor(3.1); //=> 3`. The `floor` of negative numbers still rounds "down," i.e. away from zero: `floor(-2.3); //=> -3`. Compare to `trunc`.

***
#### `gt::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Greater than comparator, `>`. When given two numbers, returns `true` if the first is greater than the second. When given three or more numbers, returns `true` if the numbers are in decreasing order. When given one number, `gt` returns itself partially applied. Note that partial application is meant to be intuitive rather than rigorous: `gt(4)` returns a function that tests if its argument is greater than 4: `gte(4, 3); //=> true`, but `gte(4)(3); //=> false`.

***
#### `gte::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Greater than or equal comparator, `>=`. With one argument, partially applies itself. With two, returns `true` if the first is greater than or equal to the second. With three or more, returns `true` if the numbers are in decreasing or flat order, e.g. `gte(3, 2, 1, 1, 1); //=> true`. Note that partial application is meant to be intuitive rather than rigorous: `gte(4)` returns a function that tests if its argument is greater than or equal to 4: `gte(4, 3); //=> true`, but `lte(4)(3); //=> false`.

***
#### `hypot::fn`
`(...xs)`<br/>
Returns the "hypoteneuse" of a list of numbers: the square root of the sum of their squares. This will calculate the distance between the origin and a point in n-dimensional space (where n is the number of arguments passed in). Note that this can be slow, and to compare, e.g. the magnitude of vectors, you should probably use `sum_of_squares`.

***
#### `inc::fn`
`(x)::(is_num)`<br/>
Increments a number by 1.

***
#### `is_between::fn`
`(x, y)::(is_num, is_num)`<br/>
Tells if a number lies between two numbers, exclusive of the two numbers, with the first number being the lesser of the two. If the first argument is not less than the second, will always return false.

***
#### `is_even::fn`
`(x)`<br/>
Tells if a number is even. Returns `false` for non-numbers.

***
#### `is_in_range::fn`
`(x, y)::(is_num, is_num)`<br/>
Tells if a number is in the range described by the two numbers, inclusive of the two numbers, with the first number being the lesser of the two. If the first argument is not lte than the second, will always return false.

***
#### `is_infinity::fn`
`(x)`<br/>
Tests if something is Infinity.

***
#### `is_natural::fn`
`(x)`<br/>
Tells if a number is a "natural number": integers greater than or equal to `0`. Returns `false` for non-numbers.

***
#### `is_negative::fn`
`(x)`<br/>
Tells if a number is less than zero. Returns `false` for non-numbers.

***
#### `is_nonzero::fn`
`(x)`<br/>
Tells if a number is not zero. Returns false given non-numbers.

***
#### `is_odd::fn`
`(x)`<br/>
Tells if a number is odd. Returns `false` for non-numbers.

***
#### `is_positive::fn`
`(x)`<br/>
Tells if a number is positive, i.e. greater than `0`. Note that `0` is not itself positive. Returns `false` for non-numbers.

***
#### `is_positive_int::fn`
`(x)`<br/>
Tells if a number is a positive integer, i.e. an integer greater than `0`. Returns `false` for non-numbers.

***
#### `lerp::fn`
`(stop)::(is_num)`<br/>
`(start, stop)`<br/>
`(start, stop, ratio)`<br/>
Linear interpolatiion between two values. Given a `start` value, a `stop` value, and a `ratio`, calculates the number that is the ratio of the difference between them. E.g., `lerp(0, 4, 0.75); //=> 3`.

***
#### `ln::fn`
`(x)::(is_positive)`<br/>
Natural log, `ln`. Arguments to logarithmic functions must be positive.

***
#### `log10::fn`
`(x)::(is_positive)`<br/>
Log base 10. Arguments to logarithmic functions must be positive.

***
#### `log2::fn`
`(x)::(is_positive)`<br/>
Log base 2. Arguments to logarithmic functions must be positive.

***
#### `lt::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Less than comparator, `<`. With one argument, partially applies itself. With two, returns `true` if the first is less than the second. With three or more, returns `true` if the numbers are in increasing order. Note that partial application is meant to be intuitive rather than rigorous: `lt(3)` returns a function that tests if its argument is less than 3: `lt(3, 4); //=> true`, but `lt(3)(4); //=> false`.

***
#### `lte::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Less than or equal to comparator, `<=`. With one argument, partially applies itself. With two, returns `true` if the first is less than or equal to the second. With three or more, returns `true` if the numbers are in increasing or flat order, e.g. `lte(1, 2, 3, 3); //=> true`. Note that partial application is meant to be intuitive rather than rigorous: `lte(3)` returns a function that tests if its argument is less than or equal to 3: `lte(3, 4); //=> true`, but `lte(3)(4); //=> false`.

***
#### `max::fn`
`(...args)`<br/>
Returns the largest of the one or more numbers passed as arguments.

***
#### `min::fn`
`(...args)`<br/>
Returns the smallest of the one or more numbers passed as arguments.

***
#### `mod::fn`
`(x, y)::(is_num, is_nonzero)`<br/>
Modulus operation, or the remainder. Returns the remainder when the first argument is divided by the second. Second argument must not be `0`.

***
#### `mult::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Multiplies numbers. With two or more arguments, multiplies all the arguments together. With one argument, partially applies `mult`, returning a function that will multiply all its arguments, and then multiply that product by the first. E.g., `mult(2, 3, 4); //=> 24` and `mult(2)(4); //=> 8`.

***
#### `norm::fn`
`(source_end)::(is_num)`<br/>
`(source_start, source_end)`<br/>
`(source_start, source_end, n)`<br/>
`(source_start, source_end, target_start, target_end)`<br/>
`(source_start, source_end, target_start, target_end, n)`<br/>
Normalizes a number, by mapping one range onto another. Takes a number in a range, determines where it is in that range, and then places it in the proportional place in the second range. With one, two, and four arguments, returns partially applied functions. 

  

  With one argument, `source_end`, `norm` returns a function mapping its input from the range `(0, source_end)` to the range `(0, 1)`. With two arguments, `norm` returns a function mapping its input from `(source_start, source_end)` to `(0, 1)`. With four arguments, `norm` returns a function that maps its input from `(source_start, source_end)` to `(target_start, target_end)`.

  

  With three and five arguments, `norm` returns the mapped value immediately. With three arguments, it returns the number mapped from `(source_start, source_end)` to `(0, 1)`. With five, it returns the number mapped from `(source_start, source_end)` to `(target_start, target_end)`

  

  E.g.s:

  `norm(100)(33); //=> 0.33` (This maps percentages to decimals.)

  `norm(10, 20)(12.5); //=> 0.25`

  `norm(0, 10, 50, 100, 5); //=> 75`

***
#### `num::fn`
`(x)`<br/>
Attempts to produce a number from another type. Numbers pass through unharmed. `false` is `0`, `true` is `1`; strings are parsed, and, if they look enough like a number that JS thinks it knows what to do with them, you get a number back. Anything else returns `undefined`.

***
#### `pow::fn`
`(x)::(is_num)`<br/>
`(x, y, ...more)`<br/>
Exponentiation operation. When given two numbers, raises the first argument to the second. When given three or more numbers, raises the first to the second, and then raises the result of that to the third, and so on. When given one number, returns `pow` partially applied: a function that raises that first number to the power of the argument, e.g. `pow(3)(4); //=> 81` (and not 64). If you want a function that raises its argument to the power of a particular number, see `pow_by`.

***
#### `pow_by::fn`
`(x)::(is_num)`<br/>
Takes a number argument `x`, and returns a function that raises its argument to the power of `x`, e.g. `pow_by(2)` squares numbers, `pow_by(3)` cubes them, and so on.

***
#### `precise::fn`
`(precision)::(is_num)`<br/>
`(precision, n)::(is_num, is_num)`<br/>
Rounds a number to the precision specified--to the number of digits to the right of the decimal point. `0` will round to integers. Negative entries will round to the left of the decimal point. One argument gives you a partially applied function.

***
#### `rad_to_deg::fn`
`(...args2)`<br/>
Given an angle measurement in radians, converts it to degrees.

***
#### `random::fn`
`()::()`<br/>
`(x)::(is_num)`<br/>
`(x, y)::(is_num, is_num)`<br/>
Returns a (pseudo)random number. With zero arguments, returns a random number between 0 (inclusive) and 1 (exclusive). Given one argument, returns a random number between 0 (inclusive) and its argument (exclusive). Given two arguments, returns a random number between them (inclusive of the first, exclusive of the second).

***
#### `random_int::fn`
`(x)::(is_int)`<br/>
`(x, y)`<br/>
Returns a random integer. Given one argument, returns a random integer between `0` (inclusive) and that value (exclusive). Given two arguments, returns a random integer between them (inclusive of the first argument, exclusive of the second argument). Arguments must be integers. E.g. `random_int(3); //=> 0, 1, or 2` and `random_int(1, 4); //=> 1, 2, or 3`.

***
#### `round::fn`
`(x)::(is_num)`<br/>
Rounds numbers to the nearest integer. It returns integers unchanged. In most cases, it rounds positive and negative numbers as you would expect, i.e. `round(3.3); //=> 3` and `round(-3.3); //=> -3`. However, arguments with a fractional portion of `0.5` are always rounded "up," in the direction of positive infinity: `round(3.5); //=> 4` but `round(-3.5); //=> -3`.

***
#### `sin::fn`
`(x)::(is_num)`<br/>
The sine of angle (in radians).

***
#### `sqrt::fn`
`(x)::(is_not_negative)`<br/>
Takes the square root of a non-negative number.

***
#### `sub::fn`
`(x)::(is_num)`<br/>
`(x, y)`<br/>
`(x, y, z, ...more)`<br/>
Subtracts numbers. With two arguments, subtracts the second from the first. E.g. `sub(10, 4); //=> 6`. With three or more arguments, subtracts from the first argument the sum of the remaining arguments. E.g., `sub(10, 2,3); //=> 5`. With a single argument, returns `sub` partially applied, which will subtract the sum of any arguments from the original first argument. E.g. `sub(10)(1, 2, 3); //=> 4`. Note that this is perhaps unintuitive behavior. If you want a function that will subtract a given amount from its argument, see `sub_by`.

***
#### `sub_by::fn`
`(x)::(is_num)`<br/>
Takes a number and returns a unary function that subtracts that first number from its argument, e.g. `sub_by(3)(10); //=> 7`.

***
#### `sum_of_squares::fn`
`(...xs)`<br/>
Returns the sum of the squares of the numbers passed in. To compare the magnitude of vectors quickly, use `sum_of_squares`: it avoids the costly `sqrt` step in `hypot`.

***
#### `tan::fn`
`(x)::(is_num)`<br/>
The tangent of an angle (in radians): returns the slope of the line with that angle.

***
#### `trunc::fn`
`(x)::(is_num)`<br/>
Truncates the decimal portions of a number, returning integers unchanged. E.g. `trunc(3.1); //=> 3`. The `trunc` of negative numbers rounds "up," towards `0`: `trunc(-3.1); //=> -3`. Compare to `floor`.

***
#### `wrap::fn`
`(to)::(is_num)`<br/>
`(from, to)::(is_num, is_num)`<br/>
`(from, to, x)::(is_num, is_num, is_num)`<br/>
Wraps a value around a range described by `from` (inclusive) and `to` (exclusive). Particularly useful for wrapping angles around a circle.

## Values
`t`<br/>
`pi`<br/>
`e`<br/>
`sqrt2`<br/>
`sqrt1_2`<br/>
`ln2`<br/>
`ln10`<br/>
`log2e`<br/>
`log10e`