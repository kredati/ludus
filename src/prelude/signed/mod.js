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
    // from Arr
    
    // from Bool

    // from Ducers

    // from Err

    // from Flow

    // from Fn

    // from Lazy

    // from NS

    // from Num

    // from Obj

    // from Preds

    // from Ref

    // from Seq

    // from Str

    // from Type
};