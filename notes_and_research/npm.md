# On npm and packages

### `@ludus`
The organization: will hold all the things for the language. I'm still hoping to offer the `ludus` package as a bundle. But for now, let's keep things in the organization.

#### Skypack
We can also use https://skypack.dev as a package distribution mechanism for the browser, and use import maps (at least in Chrome, at least for now) to `import '@ludus/prelude';` at the beginning of most files.

### `@ludus/prelude`
The prelude: includes everything that's loaded in the global Ludus namespace. The first call globalizes all the things, so if your module is `import`ed by anything that `import`s the prelude, this `import` is technically not necessary. (Although it will be for Quokka or other 3rd party REPLs.) It also includes the namespaces of everything that's globalized.

### `@ludus/core`
Things that are officialy "a part" of Ludus, but that aren't by default globalized. `import Core from '@ludus/core';` should bring the whole core in in a single namespace. Individual constituents of the core should be accessible: `import Parse from '@ludus/core/parse.js;` should be possible.

### `@ludus/eslint`
Exports the eslint rules for Ludus.

### `@ludus/repl`
A Ludus REPL.

### `@ludus/io`
Node-based IO for Ludus.

### `@ludus/kredati`
The core Kredati library, based on p5 and oriented towards 2D graphics.

### `@ludus/k`
We need a Kredati starter project, not just the library.
