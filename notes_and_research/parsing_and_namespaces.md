# Parsing and namespaces
One of the things I'm pretty eager to do is to get rid of dot-property access on garden-variety objects. Why? Well, if you try to use dot-property access on `null` or `undefined`, you get an error. This seems bad: it makes it difficult to write properly abstract functions. So we have `get`.

But we still want dot-property access for namespaces. That means we need some way of distinguishing between namespaces and other types of objects---and one that will be available to the parser.

Consider, then, the following scheme:
* Bindings for namespaces must begin with a capital letter.
    - Anything that is bare `import`ed must be capitalized: `import L from 'ludus'`; `import {foo} from 'bar'`; but never `import {Foo} from 'bar'`.
    - Anything that is a default `export` must be a namespace: `export default Ludus` or `export default {NS.}defns(...)` or `export default {NS.}defmembers`. But never `export default foo`.
    - Anything that is a normal `export` cannot be a namespace: no `export {Ludus, NS}`.
    - The parser thus never needs to know about anything other than the functions that return namepsaces: but this could get ugly quickly...
* All other identifiers must never begin with an uppercase letter.

### Giving up the dream
I think this is where I give up this dream. The only way I can think of knowing whether something is a namespace is by executing code, which always means arbitrary code. You probably don't want to rename `defns` but maybe you do? You are more likely to want to write a function that does something to a namespace and returns it; but you can't assign it to a capital.

So what mitigations do I have?

(A) Allow dot-property access on anything. The only time JS will complain is if you're trying to access a property on `undefined`. But it will also complain if you try to invoke `undefined` as a function. So maybe this isn't so bad? Especially since it won't allow for mutation with the restrictions on assignment (only in a `let` statement, only for an identifier). In addition, JS will throw an error if you try to destructure something that's `undefined`, which if we're going to keep destructuring (omg please), then this feels expected and ergonomic. 

(B) Disallow dot property access on everything. The only way to get any property on anything, including namespaces, is to use `get`: `let defn = get('defn', Fn);` (Where does this leave destructuring?) Yeah, this does not work.

(C) Something else?

I think it's option A! The dot-operator it is. Namespaces will still by convention be capitalized. I still need to sort out some conventions here.

### Some time later, after a long weekend
It seems to me that you can probably get around the titchy issues with the above by treating namespace returning functions not as a normal function, but as a "special form," i.e. syntax, with some parsing support at runtime:
* What we want is a special form, `ns`, that can _only_ be used here: `export default ns(...);`.
* `ns` is a weird item:
    * it can take a namespace (to export it),
    * it can take a namespace and a descriptor (to amend it and export it),
    * or it can take a descriptor (to create it),
    * and, it checks _at runtime_ whether anything that's capitalized is also a namespace (no capitalized members of a namespace that aren't also namespaces),
    * but it is the ONLY function that returns a namespace (except the ones that users create, but that's their problem)
* Capitalized identifiers are only allowed in `import Namespace from 'namespace;`, where they are required, or
* When using destructuring assignment from a namespace, e.g. `let {Foo} = Bar;` but not `let {Foo} = bar;`.
    - Except: that means you can't destructure objects with capital letters as fields, which... is right?, you'd need `let foo = get('Foo', bar);`, which anyways seems correct.
    - Perhaps we don't even want to go that far? If you want, say, `Ludus.Str` as `Str`, maybe you need to `import Str from 'ludus/str'`? (This requires fun with import maps; ugh.)
    - Do we need RHS parsing support for such destructuring, to resolve whether the RHS is a namespace or not? That should be easy enough, I reckon:
        * Parsing will only allow dot-property access after a capitalized identifier, so the question is simply, is the rightmost identifier capitalized or not?
            - If it is, allow capitalized destructuring; if it is not, do not allow capitalized destructuring.

I think this actually does it, but it's also a pretty complicated algorithm. (Although probably not more complicated than destructuring anyway?)

Meanwhile, I think this probably punts on the question of how to handle writing translation layers between JS and Ludus. We'll burn that bridge when we get to it.

### Before the parser, some conventions
The parser will, in theory, enforce our naming conventions, which will have to be revised to be in line with the above. Here are the relevant conventions:
* The only capitalized identifiers are namespaces.
* That means revising the convention that types are also capitalized.
    - Types should be named in local variables (which are perforce lowercased) with the suffix `_t`, but should have their names capitalized: `let foo_t = deftype({name: 'Foo'});`. This is by convention only.
    - Types should be stored in associated namespaces at the property `t`:
        * Given `export default ns({type: foo_t, members: {...}});`,
        * When you `import Foo from 'foo';`, `Foo.t` will hold the type information.
        * `ns` will check that only a type can be stored at `t`.
