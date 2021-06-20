# Thoughts on tooling

### Ludus
* Namespaces should be statically analyzable for code completion. That means `ns` must never revise or amend a namespace, but should always only create a new namespace.
  - Also: types associated with namespaces should only ever be associated with a single namespace: no providing a new one.
* The `prelude` should only include the things that are globalized when you `import 'ludus';`.
* That means that the parser is actually a separate project! And can and should be imported separately.
* Ludus will run in Node, not Deno.

### REPL
* The REPL should be a real development REPL: it opens a file and has everything in that file loaded in its context. When that file changes, it reloads the context.
* There is interesting VSCode tooling to be done around this, perhaps.

### Kredati
* Use Snowpack as a dev server.
* Then again, this shouldn't strictly speaking be necessary?---use one of the online IDEs?
* But we should plan for both.