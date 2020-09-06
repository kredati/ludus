import Ludus from './env.js';
import * as errors from './errors.js';
import * as fns from './fns.js';
import * as eq from './eq.js';
import * as preds from './preds.js';
import * as spec from './spec.js';

let has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

let merge = (...objs) => {
  let out = {};
  for (let obj of objs) {
    for (let key in obj) {
      if (!has(obj, key)) continue;
      if (key in out) throw Error(`Name conflict: ${key} is already in ${out}`);
      out[key] = obj[key];
    }
  }
  return out;
};

let Prelude = Ludus.ns({
  name: 'Prelude', 
  space: merge(errors, fns, eq, spec, preds, Ludus)
}); //?

export default Prelude;
