* - already included
+ - to add to Ludus namespace
- - to add to namespace & Ludus
& - method

TODO:
[x] add `join` to Arr
[*] `and`/`or`/`not` methods
    [*] add speccing to `defmethod`
    [x] write these to dispatch to `Fn` or `Bool` but not `Spec` (not necessary)
[ ] consider losing the `def` in:
    [ ] defmethod -> method
    [ ] defspec -> spec
    [ ] defn -> fn
        [ ] consider collapsing `fn` and `defn`
    [ ] deftype -> type
[*] consider: should `assoc` be a method or an abstracted function? (method)
[*] are `Obj.update` and `Ref.update`  abstractable into a method? (yes)
[*] can we use `Seq.concat` as an abstracted concat, or should it be a method? (method)
[*] standardize `count` vs `size`: which should we use? (count)
[-] write methods
    [*] assoc
    [*] conj
    [*] empty 
    [*] index_of
    [*] slice
    [*] and
    [*] or
    [*] not
    [*] update
    [*] concat
    [ ] Write doc for all of the above
[*] standardize `from` across `Arr`, `Str`, `Obj`
[ ] determine what to include from `Num`
[ ] standardize across object predicates & specs: `is_obj`, `is_assoc`, etc.
    [ ] Consider Ludus nomenclature around objects, associative maps, etc.
[ ] standardize across sequence predicats & specs: `P.is_sequence` vs. `S.coll`, etc.
    [ ] Consider Ludus nomenclature around collections, sequences, etc.
[ ] consider how to handle shadowed Preds/Specs (e.g. `dict`, `at`)
[ ] consider how to handle `Flow.repeat` vs. `Lazy.repeatedly` vs. `Lazy.repeat`
[ ] replace concerete specs with predicate functions
    [ ] delete concrete specs
    [ ] replace them with predicate functions until everything runs
    [ ] consider what to do with parametric preds, specs (e.g. should `at` be a spec or a pred?)

Arr:
    * arr
    & assoc
    & concat
    & conj
    conj_
    & empty
    empty_
    from
    & index_of
    * is_index
    last_index_of
    reverse
    & slice
    sort
    unconj

Bool:
    & and
    & or
    & not
    * bool

Ducers:
    * every
    * filter
    * keep
    * map
    * none
    * some
    * take
    zip
    // and more

Err:
    * raise
    bound
    * handle

Flow:
    * when
    * cond
    * fcond
    * just
    repeat
    * always

Fn:
    rename,
    * partial,
    n_ary,
    * loop,
    * recur,
    fn,
    pre_post,
    defn,
    once,
    * thread,
    thread_some,
    * pipe,
    pipe_some,
    * comp,
    comp_some,
    + defmethod,
    & show

Lazy:
    * cycle,
    gen,
    interleave,
    * lazy,
    * range,
    ? repeat,
    ? repeatedly

NS:
    * is_ns,
    * ns,
    defmembers,
    * members,
    def,
    get_ns,
    & show

Num:
    abs,
    add,
    ceil,
    dec,
    div,
    div_by,
    floor,
    gt,
    gte,
    hypot,
    inc,
    is_natural,
    is_negative,
    is_nonzero,
    is_positive,
    is_positive_int,
    is_even,
    is_odd,
    lt,
    lte,
    mod,
    mult,
    num,
    pow,
    pow_by,
    precise,
    random,
    random_int,
    round,
    sqrt,
    cbrt,
    sub,
    sub_by,
    sum_of_squares,
    trunc,
    clamp,
    lerp,
    norm,
    rad_to_deg,
    deg_to_rad,
    cos,
    sin,
    tan,
    acos,
    asin,
    atan,
    ln,
    log2,
    log10,
    pi,
    e,
    sqrt2,
    sqrt1_2,
    ln2,
    ln10,
    log2e,
    log10e,
    & show

Obj:
    * get,
    get_,
    * get_in,
    & concat,
    &? update,
    update_with,
    * merge,
    * keys,
    * values,
    * entries,
    & empty,
    & conj,
    conj_,
    from,
    & assoc,
    assoc_

Preds:
    bool,
    * is_any,
    * is_undef,
    * is_some,
    * is_str,
    * is_num,
    * is_int,
    * is_bool,
    * is_fn,
    * is_obj,
    * is_assoc,
    * is_iter,
    * is_sequence,
    is_sequence_of,
    * is_arr,
    & not,
    & and,
    & or,
    ? maybe,
    ? at,
    * is_key,
    ? has,
    ? dict

Ref:
    * ref,
    * swap,
    * watch,
    * unwatch,
    * future,
    & show,
    &? update

Seq:
    concat,
    & empty,
    * first,
    * is_empty,
    * is_seq,
    iterate,
    * rest,
    * seq,
    & show,
    size,
    * reduce,
    * transduce,
    * into,
    complete,
    is_complete

Str:
    * capitalize,
    * chars,
    code_at,
    & concat,
    ends_with,
    * from (as `join`),
    from_code,
    includes,
    & index_of,
    is_blank,
    * is_char,
    is_empty,
    last_index_of,
    * lowcase,
    pad_left,
    pad_right,
    repeat,
    replace,
    replace_first,
    count,
    & slice,
    * split,
    starts_with,
    * str,
    * trim,
    trim_left,
    trim_right,
    * upcase,
    * words,
    & empty,
    & conj,
    & show

Type:
    + meta,
    & show,
    + deftype,
    + type_of,
    + is,
    + create,
    types,
    bool,
    num,
    str,
    obj,
    arr,
    fn,
    undef

