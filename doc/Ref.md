# `Ref::ns`
Jump to: [Namespaces](#Namespaces), [Functions](#Functions), [Values](#Values)


## Namespaces

## Functions
***
#### `deref::fn`
`({value})::(is<partial (t:{Ref})>)`<br/>
Gets the value stored in a ref.

***
#### `forward::fn`
`(name)::(is_str)`<br/>
Creates a forward reference. Allows declaration of a function before its definition. Returns a tuple with the function and a setter function. Note that the setter function may only be called once (subsequent invocations will do nothing).

***
#### `future::fn`
`(fn)::(is_fn)`<br/>
`(fn, args)::(is_fn, is_arr)`<br/>
`(fn, args, delay)::(is_fn, is_arr, is_int)`<br/>
Schedules a function call in the future.

***
#### `ref::fn`
`({name, doc, value, ...attrs})::(ref_descriptor)`<br/>
Creates a ref

***
#### `show::fn`
`(ref)::(is<partial (t:{Ref})>)`<br/>
Shows a ref.

***
#### `swap::fn`
`(ref, new_value)::(is<partial (t:{Ref})>, is_any)`<br/>
Updates the value in a ref, mutating its state. Returns undefined.

***
#### `unwatch::fn`
`(watcher)::(is<partial (t:{Watcher})>)`<br/>
Removes a watcher from a ref, such that it will no longer be called when the ref's value changes.

***
#### `update::fn`
`(ref, updater, ...args)`<br/>
Updates the value in a ref, mutating its state, by applying the supplied function to its value.

***
#### `watch::fn`
`(ref, fn, ...args)::(is<partial (t:{Ref})>, is_fn)`<br/>
Adds a watcher to a ref. The function (presumably with side effects) will be called whenever the ref changes value (i.e. somebody, somewhere `swap`ped the ref). It will call `fn` with any additional arguments passed to `watch`. Returns a Watcher, which you can then pass to `unwatch` to cancel the watcher.

## Values
`t`