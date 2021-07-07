# `Object::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
#### `assoc::fn`
`(obj, key, value)::(is_obj, is_key, is_any)`<br/>
Returns a new object with the value at that key.

#### `assoc_::fn`
`(obj, key, value)::(is_js_obj, is_key, is_any)`<br/>
Mutates an object, associating the value with the key.

#### `concat::fn`
`(obj, kvs)::(is_obj, seq<tup<is_key,is_any>>)`<br/>
Creates a new object, combining the object as the first argument with a sequence of key-value tuples. If the key-value pairs duplicate a key, silently overwrites the value; later pairs take precedence. E.g., `concat({a: 1}, [['b', 2], ['c', 3]]; //=> {a: 1, b: 2, c: 3}`.

#### `conj::fn`
`(obj, [key, value])::(is_obj, tup<is_key,is_any>)`<br/>
`conj`oins a `[key, value]` tuple to an object.

#### `conj_::fn`
`(obj, [key, value])::(is_obj, tup<is_key,is_any>)`<br/>
`conj`oins a `[key, value]` tuple to an object, mutating the object.

#### `dissoc::fn`
`(obj, key)::(is_obj, is_key)`<br/>
Returns a new object with the specified key removed. The opposite of `assoc`. E.g., `dissoc({a: 1, b: 2}, 'b'); //=> {a: 1}

#### `dissoc_::fn`
`(obj, key)::(is_js_obj, is_key)`<br/>
Deletes a key on an object, mutating the object.

#### `empty::fn`
`()`<br/>
Returns an empty object

#### `entries::fn`
`(obj)`<br/>
Returns an array of `[key, value]` pairs for each property on an object. Returns an empty array if the object has no properties. E.g., `entries({a: 1, b: 2}); //=> [ [ 'a', 1 ], [ 'b', 2 ] ]`.

#### `from::fn`
`(entries)::(seq<tup<is_key,is_any>>)`<br/>
Creates an object from an iterable containing `[key, value]` tuples.

#### `get::fn`
`(key)::(is_key)`<br/>
`(key, obj)::(is_key, is_any)`<br/>
`(key, obj, not_found)::(is_key, is_any, is_some)`<br/>
Gets the value stored at a particular key in an object. Returns `undefined` if value is not found. It returns `undefined` when looking for a property on anything that cannot have properties: e.g., `undefined`, booleans, and numbers. Given an indexed value (arrays, but also strings) it returns the value at the corresponding index. Returns only own properties. To get properties in the prototype chain, or at symbol keys, use `get_`.

#### `get_::fn`
`(key)`<br/>
`(key, obj)`<br/>
Gets the value stored at a particular key in an object, traversing the JS prototype chain, and also allowing symbols to serve as keys. Returns `undefined` if an object is missing a key, or cannot store keys.

#### `get_in::fn`
`(obj, path)::(is_any, seq<is_key>)`<br/>
`(obj, path, not_found)::(is_any, seq<is_key>, is_some)`<br/>
Nested property access. Given a collection, take a path to a particular value represented by a sequence of keys. Returns `undefined` if there is nothing at that path. E.g. `get_in({a: [1, 2, 3]}, ['a', 1]); //=> 2`.

#### `keys::fn`
`(obj)`<br/>
Returns an array of an object's keys. Returns an empty array if the object has no properties.

#### `merge::fn`
`(...objs)`<br/>
Creates a new object, combining the objects passed in. If objects duplicate a key, silently overwrites the value; later objects take precedence.E.g. `assign({a: 1, b: 2}, {b: 3, c: 4}); //=> {a: 1, b: 3, c: 4}`.

#### `show::fn`
`(obj)::(is_obj)`<br/>
Shows an object by naïvely dumping everything into a string.

#### `update::fn`
`(obj, key, fn, ...args)::(is_obj, is_key, is_fn)`<br/>
Updates a value in an object. Takes, at minimum, an object, a key, and a function, and returns a new object with the value at the key updated to be the result of passing it to the function. If the key does not exist, passes `undefined` as the old value. Any additional arguments to the function can be supplied. E.g., `update({a: 1}, 'a', inc); //=> {a: 2}`.

#### `update_with::fn`
`(obj, updates)::(is_obj, dict<is_fn>)`<br/>
Updates multiple properties at once. Given a collection and a dictionary of functions, returns a new object with updated values that are the result of applying the matching function to the value in the collection. Passes `undefined` as the argument if the value is not found. The dictionary of update functions must be flat, and the functions must be unary. E.g., `update_with({foo: 42}, {foo: inc}); //=> {foo: 43}`.

#### `values::fn`
`(obj)`<br/>
Returns an array of the values stored in an object. Returns an empty array if the object has no properties.

## Values
`t`