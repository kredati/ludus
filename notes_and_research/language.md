# On Ludus, the language

Ludus is an environment, but it's also a language. It's a subset of JS, so my field of choices is constrained. But which deletions matter, and they also intersect with the choices I make in devising the standard library.

### Things I know I want to delete, and are easy
* The whole object-oriented mess: `new`, `this`, `class`, etc. This is easy, but shows up as a penubra of various "reserved" words.
* The `function` keyword. Who needs more than one way of making a function? Just use lambdas (arrow functions) everywhere.
* Imperative iteration constructs: `for`, `for..in`, `for..of`, `while`, etc. This is very easy, and also shows up as "reserved" words. Of course, the stdlib has to provide for equivalents; especially with `loop` & `recur`, the stdlib already does this.
* JS's global namespace. This is crucial for preventing access to mutation. This _won't_ matter re: keywords.
* Mutation. This means a few different things:
  - The core functions never mutate values. This is not always easy to do with good (i.e. constant rather than linear) performance (e.g. `conj`), but I've gotten to a point where I think we're good to go.
  - No rebinding variables. This is a language restriction. The only place the assignment operator is allowed is in a `let` statement. Except, of course, in the REPL, where you should be able to rebind a variable.
  - No direct manipulation of properties. This follows from the previous restriction: the left-hand side of an assignment operation cannot be the property of an object.

### Things I know I want to delete, and aren't easy
* `null` or `undefined`. There's no sense in JS's two nothingnesses. The work I've done so far has favored `null`. These are the sticky wickets:
  - You can get around this if you use safe functional property access (`get`) all the time. So that should seem easy!
  - The problem lies in accessing imports. Importing `* as foo` imports an object. That could be disallowed. 
  - But grouping things together and managing namespaces in JS are done, always, with objects. 
  - I think I can get around this by disallowing dot-property access for everything except for explicit namespaces. (See more in namespaces.md.)
  - The next thing: we need to be able to do destructuring assignments without any of the values coming up `null` or `undefined`. Or do we? Maybe they end up `null` instead of `undefined`? I believe Ludus is better with destructuring. The question of what happens when you destructure on a property/array item that doesn't exist is an open one.
  - Even worse than destructuring in `let` bindings is destructuring in arguments.
  - Some of this is a bit semantic. The Ludus REPL can always just say `null` when it encounters `undefined`. That's _almost_ right. But that offends my intuition that `null` should always be the positive absence of a thing.
  - After these reflections, I'm beginning to think that `undefined` actually the more natural "nothing" for JS. My preference for `null`, which in JS is a kind of "positive" nothing (and is close to `nil` in Lisps) is more aesthetic than anything. I don't believe I would have to jump through any of these hoops if I used `undefined`, and ditched `null`. I believe `null` only (or almost only) shows up when you make a positive choice to introduce it, while `undefined` is all over JS.
    * What I have to do is discover whether I can control `undefined`, which seems to show up all over the place in JS, to get it to feel like a "positive" value. Are there places where having `null` instead of `undefined` is advantageous?
* `if` statements. No conditional statements! Only expressions. (Same for `swtich`.)
  - This has the keyword penumbra effect. (Ok: no `if`, `else`, `switch`, or `case`.)
  - This is not difficult if you just use ternary conditional expressions, although those get ugly quickly, if they're chained.
  - Ternaries also have the type coercion problem, as below. One possibility is to have a "special form + syntax" where ternaries only parse after a call to a special function, say `when`. So that `foo ? bar : baz` dies, but `when(foo) ? bar : baz` does. This way, Ludus, not JS, can do the type coercion; faster ternaries are available; and there's better syntactical flagging around ternaries: 
    ```javascript
    when(foo) 
      ? when(bar) 
        ? quux 
        : quuz 
      : fuzz
    ```
  - I have `cond` in mind (and perhaps also `if_else`), which I have planned as transpiling to JS--it will work, but just be slow. It has the disadvantage of not short-circuiting.
  - The `when` + ternaries solves the problem of short-circuiting, too. In addition, it should be possible to enforce, at a parsing level, the ternary that comes after `when`. This would not replace `cond` (which could be far more flexible, and enforce functions everywhere).
* JS's awful type coercion.
  - This one is _very_ hard if I remain as tied to JS as I'm planning, but I want to avoid it _very_ badly.
  - At current, `0` and `''` are falsy. The only falsy values should be `null` and `false`. It's easy enough to wrap a thing in a `boolean` (or `bool`) function to be careful; we don't want to have to ask users to do this. This suggests that we can only use non-native constructs; using non-native constructs means things are slow (a little, or a lot).
  - Some of this can be mitigated by transpiling special forms.
  - This relates closely to both `if` and the operator overloading below.
  - For `if`, one of our ways of doing conditionals is to use `||`, but that will convert `''` and `0` to `false`.
  - For operators, we get things like `3 / 'foo' //=> NaN`. Why? ::argh::
* Operator overloading.
  - This is an extension of type coercion. The reason we don't want operator overloading is because we don't want to confuse concepts. We have enough ways to concatenate strings, we don't also need `'foo' + 'bar'`.
  - The easiest thing to do would be to outlaw operators: `3 + 4` is not a valid expression, only `add(3, 4)`. This is easier to read than `(+ 3 4)`, to be honest, but it may still be weird not to be able to do `forward(x + y)`--it involves a nested function call, which will be hard for novices to grok.
  - The real issue is that, to ensure that `+` is adding two things of the same type (even numbers), the parser has to start doing typechecking. Sure, you can check if you're adding two number literals, but if you're allowing variables, you end up complecting things.
  - I don't hate the idea that we don't use operators:
    - No `===`, use `eq`.
    - No `+`, use the appropriate function. (This has the added benefit, possibly, of allowing core functions like `add` to be multimethods, and thus to allow for the addition of, say, vectors.)
* `NaN`.
  - Most of the time this occurs because of bad type coercion, as above. So we should be able to prevent it, I think, with the above restrictions. But those are hard, and I don't actually know if they will work.
  - See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN.
    * All of the cases MDN lists are easily avoided by using functions + pre/post contracts on the arguments.

### Some initial resolutions to the above
* No operators at all: no `===`, no `+`, no `<=`, no `||`.
* Switch `null` for `undefined`.
* Use `when` + ternaries for simple conditionals.
  - From a function-definition perspective, `when` is just `boolean`, but it will eventually be a special form the parser needs to know about.
* Develop namespaces.

### An informal description of Ludus
#### Statements
There are five kinds of statements:
* `import` and `export`. Because of course.
  - These need to be simplified; they're far too complex.
* `let` bindings: `let`, identifier | destructuring, `=`, expression.
* `return` statements: `return`, expression.
* a bare expression.
  - The repl should always print out the result of a bare expression.

All statements _must_ end with a semicolon. (No ASI.) The REPL thinks you're in a statement until a semicolon arrives.

#### Expressions
Expressions may consist of:
* Literals: numbers, strings, booleans, symbols, arrays, objects.
* Bare identifiers. They evaluate to the value the identifier is bound to.
* Function invocations: identifier, `(`, args (separated by `,`), `)`.
* Lambdas.
* `when` conditional expressions: `when($expr) ? $expr : $expr`.

And I think... that's it?

### Other considerations
The identifiers on the LHS of a `let` binding follow the rules of JS's identifiers. Identifiers in expressions can be either identifiers of variables in the local scope or namespace access, using dots. Dot access is not allowed on the LHS of `let` bindings (but of course, JS will yell about this, too). I will have to formalize this.