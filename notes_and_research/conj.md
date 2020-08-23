# Notes on conj

Conj is hard.

Conj in clj returns the type it's given; presumably it would be easy enough make that happen with symbols on prototypes.

But for a general O(1) addition, the easiest thing to do is to always have conj return a seq.

But that breaks the expectation that you're going to get back what you give conj. There are material differences between arrays and seqs.

One of the ways of thinking about this is that we need O(1), non-mutating ways of adding things.

assoc :: object, string, value => object can be O(1) for arbitrary cases by using prototypes; and we can abstract over the prototypical inheritcance of properties very easily. (Just have `show` and `obj_gen` not test for own properties!--and voilà.)

The issue is arrays.

This whole thing needs more hammock time. Or, in my case, floating-in-Lake-Ontario time.