# Data Structures

Oy, fast immutable data structures. Open source software is a mess.

So all of the "clever" ideas I had about how to get immutable data structures ended up flawed: a naive copying approach worked better in all instaces except for a (reasonably) naive version of a linked list.

There is, of course, a library that provides fast, immutable data structures: Immutable.js. Even though it's a "Facebook" library, it's basically unmaintained. It sounds like that may change, but for the time being, it's kind of a mess.

The trick is that the actual data structures in Immutable are _exactly_ what I want. The task very well may be to reimplement the underlying data structures. I reckon they're not exactly difficult (although a bit counter-intuitive; who thought I'd be relying on CS16 all these years later?). The whole thing is, I think, explained [here](https://hypirion.com/musings/understanding-persistent-vector-pt-1) pretty well. Also, Immutable is open source; the code isn't especially clean or readable to me, but it's there.

The other lesson, from data_structure_perfs.js, however, is that improving on even naive versions of these things is hard. Linked lists are faster for a bunch of things than copying arrays, but the naive array copy does better than a prototype-based approach, as well as a generator based approach. (Well, the generator approach is fast, but it also dies on long lists, since it runs out of stack space when `yield*`ing deeply.)

And so, the lesson is: use naive versions for a proof-of-concept. As it turns out, because we're in orbit around Clojure, the restrictions & environment I was planning for Ludus matches _precisely_ what Immutable does. (In fact, I can see some improvements: proxies can give you direct property and index access by using `get` in a handler; etc.)

And with the Ludus compiler & interpreter, it's simple enough to use Immutable/Clojure style data structures under the hood--and even convert literals into their immutable counterparts. One step at a time!