# On namespaces

One of the desiderata for Ludus is to do away with `undefined`. `null` should be the positive absence of something. Much of how I'm planning on getting rid of `undefined` is to actually prevent dot-property-access from most objects. Users will have to use `get` instead. Easy enough.

However, one thing that dot-property-access is crucial for is namespacing. We group together sets of functions (and other things) by using objects.

A few notes:
* From a module, you can export whatever you like, but to make it dot-property-accessible, you have to include it in a namespace.
* The only thing the parser has to know is whether an object is a namespace or not; this, I believe, is pretty easy.
* Namespaces will throw an error if you access something that isn't defined on them, something like `foo.bar does not exist; did you mean foo.baz?` (or something like that). That error doesn't need to be applied at parse time; the _only_ thing the parser needs to know is that `foo` is a namespace. (For this, we use JS proxies.)
* Namespaces will be easy (enough) to work with: `export default namespace({bar, quux, quuz}, {name: 'foo', doc: '...'});` (or something--I still need to figure out the simplification around imports and exports). The corresponding thing `import foo from './foo.ld.js'`. You can, of course, rename the default export in a local context: `import f from './foo.ld.js` or whatever.
* When we globalize particular features, we should be working _only_ with namespaces: no plain or bare values (I think; this is for later).
* Of course, we can still `export {foo, bar as baz}` from a file--or even `let foo = namepsace({bar, quux, quuz}; export {foo, bar, baz})`. The module imports & exports are not equivalent to namespaces, although the convention is that a single module corresponds to a namespace, and the namespace is the default export from a module.
* Part of the idea is that a single file may export several namespaces, which is not specifically ideal, but might need to happen sometime. So you can get `import {foo, bar as b} from './foobar.ld.js'` and then `foo.quux` and `b.quuz`.
* I will need to establish a strong convention of how core Ludus modules do this.
* Nested property access must be allowed: `foo.bar.baz` should work, assuming both `foo` and `bar` are namespaces.
* It may be desirable to have a construct that allows for requirements to be imposed on namespaces, e.g., Kredati `components`, which must have `init`, `step`, and `render`.