# On collections

We have several types of collections in Ludus. They behave differently. They are our core "types." UGH. Types, again.

They are:
* strings
* objects, which are both JS object literals ~~and immutable hashes~~
* arrays, which are both JS array literals and immutable arrays
* lists
* ~~sets, eventually, maybe~~

## Collections and predicates
| Coll   | is_coll | is_obj | is_indexed | is_iter | is_seqable | is_sequence |
| ------ | ------- | ------ | ---------- | ------- | ---------- | ----------- |
| string |         |        | x          | x       | x          |             |
| object | x       | x      |            |         | x          |             |
| array  | x       |        | x          | x       | x          | x           |
| list   | x       |        |            | x       | x          | x           |

## How to handle abstractions
Clojure has some uneven abstractions: `assoc` works on maps and vectors, but not on anything else; and `dissoc` only works on maps. That makes sense! But it requires the user to reason about the data structures they're using to see the sense. And while that sounds like it might be a wise idea for a language that is almost certain never to be a person's first language, I feel like asking for such reasoning before people develop intuitions about these datatypes may well be asking for trouble: at least to start for my own self, perhaps the idea is to implement these functions as regular functions, and *then* make multimethods. That, at least, lets me defer the question of how to manage the abstraction in the core library.

That said, some of these abstractions are really confusingly recursively related.

## Updates as I'm working out the first draft of the stdlib
* We want `is_obj` -> `is_js_obj`, and `is_assoc` -> `is_obj`. No need to expose learners to more of the JS plumbing than we must.
* At current, colls ought to exclude strings, since `Str.concat` does not behave like `Arr.concat` (or similar): it only works with strings for all the arguments. This seems right to me; whereas arrays and lists and objects can hold arbitrary values, strings can only hold other strings. We could write `Str.concat` to pass its arguments through `Str.str`, but that seems like it's too much anticipating what users want (implicit type coercion!).
* That means that strings just behave differently, and that's fine: but that means we do need the whole shebang of different categories and predicates as above.