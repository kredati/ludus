# Thoughts on tooling

### Ludus
* Namespaces should be statically analyzable for code completion. That means `ns` must never revise or amend a namespace, but should always only create a new namespace.
  - Also: types associated with namespaces should only ever be associated with a single namespace: no providing a new one.
* The `prelude` should only include the things that are globalized when you `import 'ludus';`.
* That means that the parser is actually a separate project! And can and should be imported separately.
* Ludus will run in Node, not Deno. This is for several reasons, not least of which is that the reason to use Deno, its mimicking of browser `import`s, turns out really not to be worth it, and Node has substantially better tooling, especially for bootstrapping Kredati.
* Because it's Node, we'll be using npm for package distribution. This means putting some thought into how to organize various packages. I will have to understand a bit more how to organize packages well for this sort of application.
  - That said, one of the uses of disagregating a lot of things is that the Ludus standard library can be made available as a separate package.

### REPL
* The REPL should be a real development REPL: it opens a file and has everything in that file loaded in its context. When that file changes, it reloads the context.
* There is interesting VSCode tooling to be done around this, perhaps.

### Parser
* The parser needs to be much more fault tolerant than the current parser combinator approach. I think I can use a hybrid approach that couples the pointfree composition of parsers with handwritten Ludus functions that will be much more robust.
* In particular, we'll need stop characters for a bunch of parsers, a "bailout" when you get to a semicolon or a close curly brace (or even a close paren?). This will be necessary for all kinds of things, including a useful REPL.
* I'm wondering whether getting things up to speed for the time being is not to write my own parser but to get a set of ESLint rules that enforce correct Ludus. Since ESLint is very nearly universal, it may be a more useful (if not flexible) parser.

### Kredati
* Use Snowpack as a dev server. It's very nearly magic. In addition, its plugin system is dead simple, and will let us run a parser---and an optimizing transformer!---in an incredibly straightforward way. And if parsing fails, we can bail and *not load the code*.
* Use p5, at least to start, as the graphics engine. I don't know if it's the most performant option, but it's robust and straightforward and I know it.
* One of the questions is whether and how to impose architectures. I really think a reducer approach of `init`, `update`, `render` makes a great deal of sense, but I shall have to ponder that.

### Online IDE
* One of the more promising online IDEs is https://stackblitz.com. It's not fully realized yet, but it's got lots of good stuff. 
  - One thing to keep an eye on is that their JS frontend projects do hot reloading, but it's not clear to me what technology they're using, and therefore how to hook into a build pipeline. That said, if any online IDE is going to allow use of Snowpack (or other build system), it will be StackBlitz; their webcontainer technology is awesome.
  - Another thing to investigate is whether their instances of VSCode allow for extensions to be installed, if indeed we're using LSP to do nice things with Ludus.
  - One possible workaround for these things--and may in fact be desirable!--is whether I can use ESLint to enforce correct Ludus. This, I suspect, will keep things much more portable, since ESLint is basically everywhere--and a `.eslintrc` file can run just about anywhere.