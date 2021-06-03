# Thoughts while writing `core`
## Or, what I learn when I write actual Ludus code

### Conditional logic gets awkward
What makes them awkward?
* Given Ludus's statement logic (no statement-based conditionals), there's no such thing as early return. You only get one return per function.
* That means we can't assign any names/ids/variables based on conditional logic. 
* Well, we should prefer `when` to `cond`, because it's faster and has less syntactic overhead (function literals everywhere). But:
    - That's the only way to get assignment logic after a return.
    - Also, in Lisp's `cond`, you can have arbitrary expressions in the guard part of a clause, but in Ludus, the bias is towards function evaluation. If you have conditionals that aren't about the state of a single value, you have to write function literals.