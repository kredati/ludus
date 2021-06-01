//////////////////// Globals
// Or, munging with our environment

import Fn from './fns.js';
import NS from './ns.js';
import Ludus from './deps.js';
import S from './spec.js';

let {defn} = Fn;
let {ns} = NS;

let globalize = defn({
    name: 'globalize',
    doc: 'Globalizes a value at a particular identifier.',
    pre: S.args([S.str, S.any]),
    body: (id, value) => {
        globalThis[id] = value;
    }
});

let context = defn({
    name: 'context',
    doc: 'Globalizes en masse all members of an object at appropriate keys.',
    pre: S.args([S.obj]),
    body: (ctx) => Object.keys(ctx).forEach((key) => globalize(key, ctx[key]))
});

export default ns(
    Ludus,
    {globalize, context}
);
