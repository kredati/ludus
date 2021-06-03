# On the possibility of some functional hacks

One of the more interesting things I've seen is the possibility of using functions in all the places to simulate some of the better features of lisps. Consider the following, from https://stackoverflow.com/questions/51407631/how-to-simulate-let-expressions-in-javascript:
```javascript
let flet = (...fs) => {
  let result = undefined;
  for (let f of fs) {
    result = f();
  }
  return result;
};

flet((x = 1, y = 2) => add(x, y));
```
In this instance, what we have with the default parameters is something like real let bindings in lisps. This pattern is going to be _slow_, but it will also be useful in lispifying JS, and in managing the functional characteristics of Ludus as a language. In many ways, it's the default parameters that give this the let-like characteristics. Consider also the following:
```javascript
let $ = (...exprs) => exprs[exprs.length - 1];

$(null, undefined, 42); //=> 42
```
In this case, we have a function that will behave exactly like the function bodies of Clj's functions. It returns the value of the last passed expression, and evaluates the others. Usually you'd only have one, since we're talking pure functional language. Strictly speaking, this is unnecessary---the comma operator already does this. The difference is the behaviour when there is nothing: `$()` returns undefined; `()` in place of an expression is a `SyntaxError`. 

Ultimately, what this makes me think is that perhaps we can push even further on the expression-only bias of Ludus. If we have something like `flet` and free use of the comma operator (which does not require parens, remember!), then we can also do away with the necessity of statements inside function bodies. I suspect we'd see an explosion of commas---lisp only uses spaces, and I reckon that makes things easier---but it's should be possible to write everything with expressions.

My sense of the matter is that this is probably a good idea to implement! And to explore the space of. But that Ludus should also definitely keep the statement-based function body semantics around, too. Javascript allows both, Ludus should, too. But Ludus should also enable the most ergonomic way of writing exclusively expression-based code as well.

### `fundef` and other control structures
One thing this also makes me think of, which is I reckon closely related in a semantic sense but actually fairly different from an end-user sense, is the set of functional, expression-based conditional constructs in Ludus. One of the problems with Ludus vs. JS is that we have different methods of coercing things to booleans, or, in other words, different definitions of truthy and falsy. Because of that, bare ternary conditional expressions don't work, since they'll use JS's truthy-falsy; so at the parsing level, ternaries can only follow one form, which I have been thinking of as `when`, since we can't use `if`. But Clojure has a lovely form, `when`, which looks like this: `(when cond expr1 expr2)`, which only evaluates the `expr`s when `cond` is *not* falsy. This is a useful form for making nil punning possible, and I think that Ludus will have to inherit the nil punning ethos of Clojure (even if certain places, e.g. empty collections, nil punning won't work). So Clj's `when` is useful. And naming things is hard. One replacement for the original sense of `when` in Ludus is `if_else`, which comes straight from Logo. Of course, naming things is hard.

This is a bit rhizomatic. But, one of the basic points in `flet` but also `when` and `cond` and `if_else` is that we normalize expressions, and, especially _normalize using lambdas all the places to defer evaluation_. And naming things is hard. One replacement for the original sense of `when` in Ludus is `if_else`, which comes straight from Logo. Of course, naming things is hard. Naming things isn't the point now: it's the structure of lambdas all the places, including in `flet` bindings and `cond` expressions and whatnot. (Lambda over let, here!)

### Parsing as help here
From a purely semantic point of view, `flet` is hard to check for correctness. It really should take a lambda literal that has default values for every argument. That's not possible to check except at the parsing level. We already have some validation here at the parsing level planned: `if_else` (or `when` or whatever) is the only form that can be followed by `? ... : ...`---and also it *must* be followed by the conclusion of a ternary. So, we can enforce that every member of `flet` is a lambda literal with default values for every param. 

### Naming
Naming things is hard. We know this. The issue of not shadowing JS names makes things even harder. Here is an attempt to sort out some of the names:
* `if`. Can't use because: JS `if` expressions. Alternatives: `if_else` (from Logo); `when` (problem: shadows Clj's `when`). I like `if_else` as a place to start, since it also reinforces the idea that ternaries, `if_else(cond) ? if_true : if_false`, must contain both a true and a false branch.
* `when`. Clj's `when` is, effectively, a gussied up `if` that (a) can take multiple expressions, and (b) has no false branch. So in Ludus, this would look like: `when(cond, expr1, expr2, ...)`. `cond` in this case is a value, evaluated to Ludus truthy/falsy.
* `cond`. `cond` is an old lisp friend. At least to start, to keep things simple, it has a single form: `cond(value, ...clauses)`. A `clause` here is a tuple: `[predicate, result]`. Both `predicate` and `result`, crucially, functions. Everything is deferred. Automatic partial application of predicate functions will make the left hand sides of clauses easy to write. At least for our very first version of Ludus, we're not going to try to do anything fancy with the RHSes (meaning, try to detect: function vs. value, or the arity of the passed-in functions).
* `flet`. This is the name I don't like. We can't use `let`, because of JS let. So: `flet` is functional-let. But it could be `make`, which might work. `make` has a special place in Logo: `make name value` is how you bind a name. `bind` has a meaning on the function side of things, and I'd prefer not to have that particular conflict. I feel like `make|flet` is going to be used often enough that a shortcut like `m` or `$` might be worthwhile. But again, niceties. For now, `make`: `make((x = 2, y = 3) => mult(x, y)) //=> 6`.

### Completeness
One of the things it occurs to me, after writing that, is that there's probably a much smaller part of the language I can develop without all the bells and whistles. Indeed, foregoing bells and whistles will help determine the design space for bells and whistles. Knowing where there's work left to do is a problem of project management, but the idea here is that the MVP is more modest than my imagination allows. Worse is better and all that. One of the things to do here is to develop a sense of the things that must be in place before a reasonably working prototype is in play.

