# From Prelude to Core

`core` is distinguished from `prelude` in two respects:
* everything in `core` is proper Ludus; no JS shenanigans
* unlike `prelude`, where most of the effort goes into writing the stdlib (and what belongs in the global namespace), `core` has several modes:
    - a few new namespaces that are part of the stdlib (e.g. `List`)
    - namespaces that provide specific general functionality, but whose members will not be globalized (e.g. `Parse`)
    - revisions to and expansions of `prelude` namespaces (e.g. additional `Fn` functions)
    - possibly replacement of some `prelude` functions with methods as we build out new namespaces (e.g. `add` adds numbers and vectors)

## New namespaces
[*] List: a linked list
[ ] Parse: parser combinators
[ ] Vect: vectors & vector math

## Expanded namespaces
[*] Fn: add function manipulation

