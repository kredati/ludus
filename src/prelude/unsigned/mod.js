import Ludus from './base.js';
import {eq} from './eq.js';
import Error from './errors.js';
import Fn from './fns.js';
import Pred from './preds.js';
import Spec from './spec.js';

Ludus.NS.defmembers(Ludus, {
  Error, Fn, Pred, Spec, eq
});

export default Ludus;
