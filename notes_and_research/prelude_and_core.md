# Prelude and Core
## What goes where?

Prelude is what is always exported into the global namespace when a user includes `import '@ludus/prelude';`. Core includes parts of the ludus stdlib that must be `import`ed individually.

### Definitely in Prelude
* Basic type namespaces:
  - Type
  - NS
  - Err
* Atomic type namespaces:
  - Bool
  - Num
  - Str
* Aggregate type namespaces:
  - Arr
  - Obj
  - List
* Function namespaces:
  - Fn
  - Pred
* Ludus derived types:
  - Seq
  - Lazy
  - Spec
  - Ref
* Individual methods in `method`
* `eq`
* Control flow
  - Flow
* Ducers
* `doc`

### Definitely in Core
* Variants & `match`
  - Also, core variants: `option`, `result`
* Parse (parser combinators)
* IO: node-based IO
* Doc: a documentation generator