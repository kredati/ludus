# Specs and Preds in the Global Namespace
One of the design flaws in this current iteration of Ludus is the duplication between predicate functions and specs and type functions. To wit:

* There's a predicate function, `is_arr`, which tells if something is an array.
* There's a parameterized predicate function, `is(Arr.t)`, which tells if something is an array.
* There's a spec, `Spec.arr`. Note also that in every place you can pass a spec, you can also pass a predicate fucntion.
* This `Spec.arr` shadows in the spec namespace `arr`, which creates arrays. That means that in std global namespace, `arr` creates arrays and we have to explicitly reference `Spec.arr` to get it. This negates the shorthandiness of the `arr` spec over the predicate functions.
* In Clj, the spec library doesn't actually provide concete specs, but uses normal predicate functions. So you get something like `(s/defspec ::key (s/or string? number?))`. The equivalent in Ludus should be `spec({name: 'key', pred: or(is_string, is_number)});`. It strikes me that we can also use normal predicate function combinators to combine most specs (i.e., we don't need to use `Spec.or` there, although we could).
* This suggests a plan of action:
    - Yank the concrete specs.
    - Make sure we have all the predicate functions we need.
    - Replace all specs with predicate functions in place of concrete specs.

### Complex (combined or parametric) preds and specs
The key difference between specs and predicate functions is that specs are able to offer feedback about *why* something didn't pass: you can use `explain` and see why a thing didn't do what it was supposed to. Predicate functions simply return true or false, and you have to be able to reason from their name and the return value what happened.

Thus, `tup` and `record` (`rec`?---`tuple` is a shorter word than `record`) are absolutely necessarily specs. I believe that `dict` is probably best a spec.

`has` is probably simple enough for a predicate: if you know what it is, you can figure out what went wrong (especially if its partially applied self has a descriptive name). But `at` is actually usefully a spec, since it will want to know what key it's interrogating.

### Args vs seq
`args([foo])` and `seq(foo)` are identical; we don't really need `seq` in most cases. I've removed `seq` in the `pre`conditions of all functions, replacing it with `args`.

That said, `args` actually calls `seq`. But we definitely should not have it shadow `seq`. So: I've renamed it `iter_of`, since it takes any iterable.