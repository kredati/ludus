# `List::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `car::fn`
`(...args2)`<br/>
Returns the first element of a list. This is the classical lisp name for this operation. Short for "contents of the address register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `first`.

#### `cdr::fn`
`(list)::(is_list)`<br/>
Returns the contents of a list, excepting the first element, e.g. `cdr(list(1, 2, 3)); //=> ( 2, 3 )`. This is the classical lisp name for this operation. Short for "contents of the decrement register," which refers to the hardware operations underlying the first implementations of lisp in the 1950s. An alias for `rest`.

#### `concat::fn`
`()::()`<br/>
`(xs)::(is_iter)`<br/>
`(xs, ys, ...more)`<br/>
Concatenates lists (or any iterable).

#### `conj::fn`
`()::()`<br/>
`(value)::(is_any)`<br/>
`(list, x)::(is_list, is_any)`<br/>
Adds a value to a list, list first. `conj` is thus a reducer, and is the Ludus-preferred way. Short for "conjoin".

#### `cons::fn`
`(x)::(is_any)`<br/>
`(x, list)::(is_any, is_list)`<br/>
Adds a value to a list, value first. This is the classical lisp way, and included for historical reasons. Short for "construct".

#### `empty::fn`
`()`<br/>
Returns an empty list.

#### `first::fn`
`(...args2)`<br/>
Returns the first element of a list.

#### `from::fn`
`(xs)::(is_iter)`<br/>
Creates a list from an iterable.

#### `is_list::fn`
`(...args2)`<br/>
Tells if something is a list.

#### `iterate::fn`
`(list)::(is_list)`<br/>
Iterates through a List.

#### `list::fn`
`(...elements)`<br/>
Creates a list of the arguments, in order. E.g., `list(1, 2, 3); //=> ( 1, 2, 3 )`.

#### `rest::fn`
`(list)::(is_list)`<br/>
Returns the contents of a list, excepting the first element, e.g. `rest(list(1, 2, 3)); //=> ( 2, 3 )`.

#### `show::fn`
`(list)::(is_list)`<br/>
Shows a list

## Values
`t`