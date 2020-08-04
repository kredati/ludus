# On spec and parse and predicates
There's a lovely little essay on spec at https://swannodette.github.io/2016/06/03/tools-for-thought/. One of the insights here is this: "clojure.spec takes Matt Might et. al. Parsing with Derivatives and really, really runs with it. By casting validation as fundamentally a parsing problem (computer science!), we get a wonderfully expressive language for crisply describing our Clojure programs without changing how we joyfully write them." (The link for Matt Might et al. is http://matt.might.net/papers/might2011derivatives.pdf.)

The fundamental idea here is that spec might secretly be a parser combinator, and that the same infrastructure might be used for both. This actually makes an extraordinary amount of sense when it comes down to it, since you might want to match zero-or-many or one-or-many items. Parser combinators pop chars off a seq, but they could just as well pop arguments off a list of args, etc.

Also in other words, parser combinators are secretly actually boolean combinators across sequences, and it's only just coincidence that they're normatively understood as parsers.

## The difference between spec and predicates
It's useful to have a set of combinators for predicates that doesn't do the whole thing of spec, especially since spec as a kind of parser simply posits the existence of predicates. What that means is that it will still be useful not only to have predicates like is_string, is_number, is, has, etc., but also `and`, `or`, `not`, etc. These boolean combinators will be very useful, even in working to develop the parser/spec. And they will be plain old functions: no metadata, no way of telling what they do. Just names, inputs, and outputs.

Spec will be much more complex, but the parser strategy will mean that the work going into getting spec errors to be really good will also be the work going into making parsing errors really good.

## On `pre`, `post`, and `sign`
Somewhat orthogonal to this, but still related, is the idea of `pre` and `post` calls for functions. I believe they don't need to know about spec: they need only to be able to execute arbitrary predicates. What spec gives you is much better error messages when shit does go wrong. But the functions themselves do not and should not need to know whether those predicates are simple functions or something much more powerful.

Two issues arise: a nice shorthand for verifying arguments (`sign`, in place of `pre` and `post`), and also a way of propagating the nice error messages spec should eventually give me in place of a bare `assert`--since I reckon especially beginner users should be able to see something more helpful than `arguments to foo did not conform to spec` or whatever.

Ultimately, I think the idea is that, like `show`, `explain` (or similar) can be a rich multimethod that does a lot of decision-making when it's called. That means I can start working with simpler predicates right now, although I do need to be careful about circular dependencies at this point.

## What spec is supposed to do
The idea is that both a parser and spec (which is a kind of parser) is supposed to give very, very good error messages. And so doing the work on them will be all kinds of useful for the Ludus parser as well. In many ways, this sort of validation--without static typechecking, but much more robust than what you can get in JS. I have Alexis King's Haskell slogan in my head: "[parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)." Which in her case is supposed to mean something about types. Indeed, I can (and should, and am planning to) definitely use types as part of a parsing scheme. But that seems more incidental to the point King is making: 

> Consider: what is a parser? Really, a parser is just a function that consumes less-structured input and produces more-structured output. By its very nature, a parser is a partial function—some values in the domain do not correspond to any value in the range—so all parsers must have some notion of failure. Often, the input to a parser is text, but this is by no means a requirement, and `parseNonEmpty` is a perfectly cromulent parser: it parses lists into non-empty lists, signaling failure by terminating the program with an error message.

Point being that parsing is a perfectly general and extremely helpful way of thinking about how to handle intersections with the outside world. It makes errors in input explicit and helpful, and that doing argument checking on input to functions, or input to a REPL, is something like the same problem in a context like Clj/JS. The impulse towards dynamism and live coding means that parsing of this sort ends up being extremely important: especially with language learners, you're really working with all kinds of messy input.

## Dependencies
The only issue for me so far, and one that will end up only getting worked out in practice, is the question of priority. The parsers we're talking about are going to be much more helpful with a certain amount of the foundation of Ludus built out; parsing with parser combinators and/or Clj's spec is non-trivial. It remains to be seen 

## Common errors
A paper I read (Nienaltowski et al, "Compiler Error Messages," _SIGCSE_ 2008) suggests that the two most common error messages are unbound variables and wrong number of arguments. Wrong number/kind of arguments can be handled pretty gracefully in Ludus. Unbound variables are a different kind of problem: typos, or thinking something's in scope when it's not. That is a parsing problem par excellence, but also a parsing plus knowing about your environment problem. Ludus can't hand this problem off to JavaScript, since JS's errors are awful. (If not as bad as some languages'.) It will be worth considering how especially good compilers handle this, e.g. Elm's.