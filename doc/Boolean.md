# `Boolean::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `and::fn`
`(x)`<br/>
`(x, y, ...more)`<br/>
Boolean `and` (`&&`) of values. With one argument, returns a function that is the `and` of its arguments with the original value. With two or more arguments, `and`s all the arguments. If an argument returns falsy (`undefined` or `false`), returns that value, and does not proceed further. Otherwise it returns the last value. Deals in truthy and falsy, not literal `true` or `false`. Short circuits on the first falsy value, but since all arguments are evaluated before being passed to `and`, all arguments are indeed evaluated.

***
#### `bool::fn`
`(x)`<br/>
Coerces a value to boolean `true` or `false`: returns false if a value is `false` or `undefined`. Otherwise returns true.

***
#### `not::fn`
`(x)`<br/>
Boolean `not` (`!`) of a value. Deals in truthy and false, not literal `true` or `false`. E.g., `not(3) //=> false`.

***
#### `or::fn`
`(x)`<br/>
`(x, y, ...more)`<br/>
Boolean `or` (`||`) of values. With one argument, returns a function that is the `or` of its arguments with the original value. With two or more arguments, `or`s all the arguments. Returns the first truthy value. If all values are falsy (`undefined` or `false`), returns the last argument. Deals in truthy and falsy, not literal `true` and `false`. Short-circuits on the first truthy value, but since all arguments are evaluted before being passed to `or`, all arguments are indeed evaluated.

## Values
`t`