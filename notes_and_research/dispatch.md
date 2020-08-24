# On dispatch

This is kind of a chew toy, but it's worth chewing on for a hot minute.

### On clj's dispatch
In the "History of Clojure," Rich Hickey points out that one of the enabling conditions of Clojure was Java's fast runtime polymorphism; the same holds for JS. They obviously have different methods for getting this fast dispatch. Effectively, we're doing method delegation.

Clojure, however, doesn't only use the host language's method dispatch; it has multimethods. Multimethods are more "Clojurish." Indeed. But now we have two ways of accomplishing dispatch. Clojure programmers are a smart bunch--some studies show they're the highest paid in industry, on average. Clojure in many ways has learner-friendliness as an anti-goal. So the philosophy is: use multimethods, or the host methods, whichever suits your purposes best.

### On Ludus's dispatch
Ludus is also a hosted language, and thus has some of the same. It has a few important design differences from Clojure, however:
* Industrial strength & speed are not a design goal (although reasonably sophisticated animations are).
* Friendliness-to-learners is an explicit design goal (excellent error messages, to be sure, but also clear & consistent ways of doing things, and hopefully, usually only one reasonably unambiguous way of doing a thing).
* A sub-goal of the above is to make the abstractions as little-leaky as possible. Don't leak inheritance! Don't leak prototypes! This is especially true with the (ab)use of prototypes to implement fast, immutable data structures.

Perhaps more to the point, prototype-based dispatch should be relatively easy to accomplish in an API that is similar to multimethods: simply adding methods to symbols on prototypes should do it. Consider my example from my notes on `conj`:

```javascript
const conj_tag = Symbol('ludus/conj');

Array.prototype[conj_tag] = (arr, value) => { /* ... */ };
String.prototype[conj_tag] = (str, value) => { /* ... */ };
//... etc., for Map, Set, ...and seq?

const conj = (obj, value) => obj[conj_tag](value);
```

Abstracting over this is plainly easy, on the model of multimethods.

### On worrying about dispatch
Ludus only has to be fast-enough; we'll discover whether it is once I'm far enough along to start doing some basic animations. But futzing with dispatch seems like premature optimization, especially since it's an optimization I'm comfortable with.

For now, let's stick with Ludus multimethods. 

#### One small closing tought
It might be possible to devise optimizing multimethods, where a particular dispatch function could trigger storing the methods on prototypes rather than in a Map. Of course, this only works for Javascript-based objects.

