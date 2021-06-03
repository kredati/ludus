# Data Structures

Oy, fast immutable data structures. Open source software is a mess.

So all of the "clever" ideas I had about how to get immutable data structures ended up flawed: a naive copying approach worked better in all instaces except for a (reasonably) naive version of a linked list.

There is, of course, a library that provides fast, immutable data structures: Immutable.js. Even though it's a "Facebook" library, it's basically unmaintained. It sounds like that may change, but for the time being, it's kind of a mess.

The trick is that the actual data structures in Immutable are _exactly_ what I want. The task very well may be to reimplement the underlying data structures. I reckon they're not exactly difficult (although a bit counter-intuitive; who thought I'd be relying on CS16 all these years later?). The whole thing is, I think, explained [here](https://hypirion.com/musings/understanding-persistent-vector-pt-1) pretty well. Also, Immutable is open source; the code isn't especially clean or readable to me, but it's there.

The other lesson, from data_structure_perfs.js, however, is that improving on even naive versions of these things is hard. Linked lists are faster for a bunch of things than copying arrays, but the naive array copy does better than a prototype-based approach, as well as a generator based approach. (Well, the generator approach is fast, but it also dies on long lists, since it runs out of stack space when `yield*`ing deeply.)

And so, the lesson is: use naive versions for a proof-of-concept. As it turns out, because we're in orbit around Clojure, the restrictions & environment I was planning for Ludus matches _precisely_ what Immutable does. (In fact, I can see some improvements: proxies can give you direct property and index access by using `get` in a handler; etc.)

And with the Ludus compiler & interpreter, it's simple enough to use Immutable/Clojure style data structures under the hood--and even convert literals into their immutable counterparts. One step at a time!

### Later...
I promised myself I would use naive versions for proof of concept! And yet, today I implemented much of a prototype version of a Clojure-style persistent vector. The rationale behind this is as follows:
* I will, eventually, really actually need fast-enough persistent data structures. Eventually is today!
* As it turns out, they're really not all that hard to implement.
* But also, the versions that are easy to find--Immutable and Mori--are both largely unmaintained and apparently buggy. This isn't great!
* Perhaps more to the point, in addition to being buggy, they both come with downsides:
  - Mori's bugginess comes from Google's Closure compiler and I don't want to have to try to understand it.
  - Immutable's bugginess may be more tractable for me to fix, but the code is pretty incomprehensible.
* And so, I have a chance at a clean persistent vector. Yay! I'm most of the way there, after less than a day of work.
* That said, the performance ain't great; time to get down to brass tacks with the bit fiddling and the loop wrangling. The performance slows rather a lot with large vectors; I suspect that has to do with doing a lot of complicated (modulo, division) arithmetic.
  - The `MASK` technique for bit fiddling in the hypirion article above is intriguing. Use it; learn it well; it will help with HAMTs.
  - Also, as it turns out, setting the node size to 32 actually improves things a great deal.

#### But oy, the HAMT
Immutable's HAMT--hash array-mapped trie, or Clj's map--implementation is a mess of indirection; again, I couldn't read the code after going several levels deep into functions and classes and modules, couldn't even get to the real heavy lifting. I found a HAMT implementation that's much more tractable, but for reasons I haven't yet figured out, is buggy. (`foo.set({a: 1, b: 2}, 'foobar').get({a: 1, b: 2})` returns `undefined`, which isn't right.) HAMTs are rather a bit fiddlier than persistent vectors, but a few days of work will get me there.

That said, it strikes me as a little less important to get HAMTs right, since neither I nor my learners are going to have million-field records: naive copy-on-write seems like it will do better for objects than for arrays.

The logic of HAMTs is still a bit mind bending. See:
* Phil Bagwell, "Ideal Hash Trees" (PDF downloaded, but googlable)
* https://en.wikipedia.org/wiki/Hash_array_mapped_trie

#### On HAMTs and keys
One thought about HAMTs is that they're able to store arbitrary keys, like JS's Maps. That said, object literals only store keys. It feels like a leaky abstraction to only be able to use string keys in object literals, but to be able to store arbitrary keys using `assoc`. It also feels like a leaky abstraction to have a stupid data structure that uses string keys only and a better one that uses arbitrary values as keys.

#### Mutate when you can
Finally, it should be easy enough to use mutating methods for both objects and arrays inside of most (all?) reducers. These methods will be faster than anything I can hand roll. And so for real this time, don't bother with HAMTs; copy-on-write, and start to do the performance optimization only once the whole system is basically working. You have a roadmap for plausibly improving performance; follow it when you need it.