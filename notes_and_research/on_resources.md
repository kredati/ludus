# On resources, environtments, architectures

One idea I arrived at in working on Ludus is that I would use, as much as possible, a deeply minimal set of resources. I don't remember explicitly forming that intention. It does bring with it some advantages: it does mean a kind of portability, and also a self-sufficiency. I would actually rely on Immutable.js if it were maintained and less buggy. I also am planning on using p5.js as my graphics backend, at least to start.

At the same time, the more dependencies we have, the more we have to load in a browser. Perhaps more to the point, the bigger and hairier project management becomes. That said, https://skypack.dev/ looks like it could solve a lot of this pain, if we use deno instead of node.

## Idea the first: Use deno
Deno isn't as