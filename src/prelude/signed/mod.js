import Arr from './arr.js';
import Bool from './bools.js';
import Ludus from './deps.js';
import Ducers from './ducers.js';
import Err from './errors.js';
import Flow from './flow.js';
import Fn from './fns.js';
import Lazy from './lazy.js';
import NS from './ns.js';
import Num from './nums.js';
import Obj from './objs.js';
import Preds from './preds.js';
import Ref from './refs.js';
import Seq from './seqs.js';
import Spec from './spec.js';
import Str from './strings.js';
import Type from './type.js';
import Mthd from './methods.js';

import './eq.js';
import './globals.js';

let ctx = {
    L: Ludus, Ludus, Arr, Bool, Ducers, Err, Flow, Fn, Lazy, NS, Num, Obj,
    Preds, Ref, Seq, Spec, S: Spec, Str, Type,
    // core Ludus language functions (special forms + absolute core)
    when: Flow.when, cond: Flow.cond, fcond: Flow.fcond,
    ns: NS.ns, raise: Err.raise, eq: Ludus.eq,
    loop: Fn.loop, recur: Fn.recur,
    // Ludus util functions,
    print: Ludus.print, warn: Ludus.warn, report: Ludus.report, 
    show: Ludus.show,
    // basic types
    arr: Arr.arr, bool: Bool.bool, num: Num.num, ref: Ref.ref, seq: Seq.seq,
    str: Str.str,
    // methods
    ...NS.members(Mthd),
    // from Arr
    is_index: Arr.is_index,
    // from Bool
    // from Ducers
    every: Ducers.every, filter: Ducers.filter, keep: Ducers.keep,
    map: Ducers.map, none: Ducers.none, some: Ducers.some,
    take: Ducers.take,
    // from Err
    handle: Err.handle,
    // from Flow
    just: Flow.just, always: Flow.always,
    // from Fn
    partial: Fn.partial, thread: Fn.thread, pipe: Fn.pipe, comp: Fn.comp,
    // from Lazy
    cycle: Lazy.cycle, lazy: Lazy.lazy, range: Lazy.range,
    // from NS
    is_ns: NS.is_ns, members: NS.members,
    // from Num
        // TODO
    // from Obj
    get: Obj.get, get_in: Obj.get_in, merge: Obj.merge, keys: Obj.keys,
    values: Obj.values, entries: Obj.entries,
    // from Preds
    is_any: Preds.is_any, is_undef: Preds.is_undef, is_some: Preds.is_some,
    is_str: Preds.is_str, is_num: Preds.is_num, is_int: Preds.is_int,
    is_bool: Preds.is_bool, is_fn: Preds.is_fn, is_obj: Preds.is_obj,
    is_js_obj: Preds.is_js_obj, is_iter: Preds.is_iter, is_sequence: Preds.is_sequence,
    is_arr: Preds.is_arr, is_key: Preds.is_key,
    // from Ref
    swap: Ref.swap, watch: Ref.watch, unwatch: Ref.unwatch, future: Ref.future,
    // from Seq
    first: Seq.first, is_empty: Seq.is_empty, is_seq: Seq.is_seq, rest: Seq.rest, count: Seq.count, reduce: Seq.reduce, transduce: Seq.transduce,
    into: Seq.into,
    // from Str
    capitalize: Str.capitalize, chars: Str.chars, is_char: Str.is_char, lowcase: Str.lowcase, split: Str.split, join: Str.from, trim: Str.trim,
    upcase: Str.upcase, words: Str.words,
    // from Type
    meta: Type.meta, type_of: Type.type_of, is: Type.is, create: Type.create
};
