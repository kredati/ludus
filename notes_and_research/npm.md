# On npm and packages

A basic roadmap for the constituents of the language as they are/will be available to npm.

### `@ludus`
The organization: will hold all the things for the language. I'm still hoping to offer the `ludus` package as a bundle. But for now, let's keep things in the organization.

#### Skypack
We can also use https://skypack.dev as a package distribution mechanism for the browser, and use import maps (at least in Chrome, at least for now) to `import '@ludus/prelude';` at the beginning of most files.

### `@ludus/prelude`
The prelude: includes everything that's loaded in the global Ludus namespace. The first call globalizes all the things, so if your module is `import`ed by anything that `import`s the prelude, this `import` is technically not necessary. (Although it will be for Quokka or other 3rd party REPLs.) It also includes the namespaces of everything that's globalized.

### `@ludus/core`
Things that are officialy "a part" of Ludus, but that aren't by default globalized. `import Core from '@ludus/core';` should bring the whole core in in a single namespace. Individual constituents of the core should be accessible: `import Parse from '@ludus/core/parse.js;` (or w/o the `.js` extension) should be possible.

### `@ludus/eslint-plugin`
An ESLint plugin that parses Ludus code.

### `@ludus/eslint`
An ESLint-based parser for Ludus code, integrating rules from other plugins as well as `@ludus/eslint-plugin`.

### `@ludus/kredati`
The core Kredati library, based on p5 and oriented towards 2D graphics. (A Kredati starter will be clonable on GitHub for early days.)

### `@ludus/repl`
A Ludus REPL.

### `@ludus/parser`
A Ludus parser. (But maybe we can depend on the ESLint rules for a [long] while?)

### `@ludus/lsp`
A Language Server for Ludus.
