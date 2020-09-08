//////////////////// Show
// A multimethod for making things pretty.

import F from './fns.js';
import O from './objs.js';

let {defmulti} = F;
let {get} = O;

let show = defmulti({
  name: 'show',
  on: (x) => x.show, // as it turns out, we want `get` for this
  not_found: (x) => x.toString()
});

export {show};