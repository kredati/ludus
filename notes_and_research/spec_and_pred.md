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
