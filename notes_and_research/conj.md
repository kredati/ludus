# Notes on `conj`, or how to abuse prototypes

`conj` is hard.

`conj` in clj returns the type it's given; presumably it would be easy enough make that happen with symbols on prototypes.

But for a general O(1) addition, the easiest thing to do is to always have `conj` return a `seq`.

But that breaks the expectation that you're going to get back what you give `conj`. There are material differences between arrays and `seq`s.

One of the ways of thinking about this is that we need O(1), non-mutating ways of adding things.

`assoc :: object, string, value => object` can be O(1) for arbitrary cases by using prototypes; and we can abstract over the prototypical inheritcance of properties very easily. (Just have `show` and `obj_gen` not test for own properties!--and voilà; although consider that using prototypes breaks the ordering of keys.)

### On arrays
The issue is arrays.

This whole thing needs more hammock time. Or, in my case, floating-in-Lake-Ontario time.

Or, uh, tossing and turning or playing-with-the-Node-REPL time? I realized the following since last night:

Consider that the above assoc can be used on arrays: `assoc(['bar'], 0, 'foo') //=> ['foo']`. Well, almost. The result is `Array {0: 'foo'}`, which does not pass `Array.isArray`, since its prototype an object, not an array. But it follows all the rules: it iterates properly, all the array methods work on it, etc. Adding values outside the `length` of the array adds them as properties but does not actually increase the iteration range of the array; you have to manipulate the `length` property to do that. But! You can do that.

Consider, then, an immutable `conj` for arrays:

```javascript
const conj = (array, value) => {
  let length = array.length;
  let out = assoc(array, length, value);
  Object.defineProperty(out, 'length', {value: length + 1});
  return out;
};
```
Note that this `conj` only appends for arrays. Prepending to an array will always run in linear, rather than constant, time--you have to change all the indices/keys.

### On dispatch
In this case, `conj` still requires dispatch: it's got different logic for all the things. One version is to use a multimethod; another is to develop a (presumably faster?) prototype dispatch. Consider the following:

```javascript
const conj_tag = Symbol('ludus/conj');

Array.prototype[conj_tag] = (arr, value) => { /* ... */ };
String.prototype[conj_tag] = (str, value) => //...
//... etc., for Map, Set, ...and seq?

const conj = (obj, value) => obj[conj_tag](value);
```

#### A note on optmization
At some point, I had a vague idea that I should use multimethods before relying on prototype-based dispatch, since premature optimization and better, consistent abstractions. My sense is that fiddling with prototype-based rather than multimethod-based dispatch is a "premature" optimization, ensuring that `conj` consistently runs in constant time is not. (With the exception, perhaps, of strings?--but strings are a whole other kettle of fish). Meaning: the prototype-based polymorphic dispatch is easily enough accomplished and abstracted over, and can be fiddled with if need be. The data structure and algorithm bit is far more important than the implementation detail of dispatch. (See also dispatch.md.)

### On `show`
One of the things to note is that the Node & plugin REPL will `print` these wrong. Because the goal in Ludus is eventually to have a custom REPL, I'm not so concerned about this: `show` will simply iterate through all enumerable properties, and not test for own properties. Easy!

### On memory vs. computation
I assume that the prototype chains here will get long & windy; it's very possible this particular scheme will be a source of memory leaks. I'm sure figuring out how to fix that is above my paygrade. Of course, every new object literal will break the chain, as will every algorithmic transformation.