# `Array::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `arr::fn`
`(...values)`<br/>
Takes its list of arguments and returns an array containing the arguments as elements, in order.

#### `assoc::fn`
`(arr, index, value)::(is_arr, index, is_any)`<br/>
Takes an array, an index, and a value, and sets the element at the index to the value. If the index is out of range (i.e., greater than or equal to the size of the array), it returns the array unchanged.

#### `concat::fn`
`(...iters)`<br/>
Concatenates an array with zero or more iterables.

#### `conj::fn`
`(arr, x)::(is_arr, is_any)`<br/>
`(arr, x, y, ...more)`<br/>
Takes an array and a list of elements and adds those elements to the array.

#### `conj_::fn`
`(arr, x)::(isArray, is_any)`<br/>
Mutating `conj`: takes a JS array and adds an element to it, mutating it. Returns the mutated array.

#### `empty::fn`
`()`<br/>
Returns an empty array.

#### `empty_::fn`
`()`<br/>
Returns an empty mutable array. Use only when you know you need to optimize something. Used under the hood for optimizing reducers (e.g. `into`).

#### `from::fn`
`(iterable)::(is_iter)`<br/>
Takes an iterable and returns an array containing the iterable's elements.

#### `index_of::fn`
`(arr, value)::(is_arr, is_any)`<br/>
Takes an array and a value and returns the first index where the element `eq`s the value. If the value is not in the array, returns `undefined`.

#### `is_immutable::fn`
`(arr)`<br/>
Tells if an array is immutable Ludus array.

#### `is_index::fn`
`(index)`<br/>
Tells whether something is a valid index of an array.

#### `last::fn`
`(arr)::(is_arr)`<br/>
Returns the last element of an array.

#### `last_index_of::fn`
`(arr, value)::(is_arr, is_any)`<br/>
Takes an array and a value and returns the last index where the element `eq`s the value. If the value is not in the array, returns `undefined`.

#### `reduce_right::fn`
`(fn, arr)::(is_fn, is_arr)`<br/>
`(fn, init, arr)::(is_fn, is_any, is_arr)`<br/>
Reduces an array from the right: from the last element to the first.

#### `reverse::fn`
`(arr)::(is_arr)`<br/>
Reverses the order of an array.

#### `show::fn`
`(arr)::(is_arr)`<br/>
Shows an array.

#### `slice::fn`
`(arr, start)::(is_arr, index)`<br/>
`(arr, start, stop)::(is_arr, index, is_int)`<br/>
Takes an array, a starting index, and an optional stopping index. Returns a new array that contains the elements of the original array from the start index (inclusive) to the stop index (exclusive).

#### `sort::fn`
`(arr)::(is_arr)`<br/>
`(arr, compare)::(is_arr, is_fn)`<br/>
Sorts the elements of the array, returning a new array with elements sorted. Takes an optional comparison function. The sorting, `compare(x, y)` should return a numerical value less than zero if x is less than y; 0 if they are equal; and a value greater than 0 if x is greater than y. E.g., to sort numbers in ascending order, `sort([2, 1, 4, 0], sub) //=> [0, 1, 2, 4]`. To sort numbers in descending order: `sort([2, 1, 4, 0], (x, y) => y - x) //=> [4, 2, 1, 0]`. If no function is passed, all elements are converted to strings and compared according to Unicode values, which can lead to some unexpected results. E.g., `sort([10, 9, 1, 32]) //=> [1, 10, 32, 9]`.

#### `unconj::fn`
`(arr)::(is_arr)`<br/>
Takes an array and returns a new array that omits the last element of the original array. Given an empty array, returns an empty array.

## Values
`t`<br/>
`index`