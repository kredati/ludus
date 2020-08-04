# On spec and parse and predicates
There's a lovely little essay on spec at https://swannodette.github.io/2016/06/03/tools-for-thought/. One of the insights here is this: "clojure.spec takes Matt Might et. al. Parsing with Derivatives and really, really runs with it. By casting validation as fundamentally a parsing problem (computer science!), we get a wonderfully expressive language for crisply describing our Clojure programs without changing how we joyfully write them." (The link for Matt Might et al. is http://matt.might.net/papers/might2011derivatives.pdf.)

The fundamental idea here is that spec might secretly be a parser combinator, and that the same infrastructure might be used for both. This actually makes an extraordinary amount of sense when it comes down to it, since you might want to match zero-or-many or one-or-many items. Parser combinators pop chars off a seq, but they could just as well pop arguments off a list of args, etc.

Also in other words, parser combinators are secretly actually boolean combinators across sequences, and it's only just coincidence that they're normatively understood as parsers.

## The difference between spec and predicates
It's useful to have a set of combinators for predicates that doesn't do the whole thing of spec, especially since spec as a kind of parser simply posits the existence of predicates. What that means is that it will still be useful not only to have predicates like is_string, is_number, is, has, etc., but also `and`, `or`, `not`, etc. These boolean combinators will be very useful, even in working to develop the parser/spec. And they will be plain old functions: no metadata, no way of telling what they do. Just names, inputs, and outputs.

Spec will be much more complex, but the parser strategy will mean that the work going into getting spec errors to be really good will also be the work going into making parsing errors really good.