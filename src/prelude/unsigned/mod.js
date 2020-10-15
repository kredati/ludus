import Ludus from './base.js';
import {eq} from './eq.js';
import Err from './errors.js';
import Pred from './preds.js';
import Spec from './spec.js';
import './fns.js';

Ludus.NS.defmembers(Ludus, {
  Err, Pred, Spec, eq
});

export default Ludus;
