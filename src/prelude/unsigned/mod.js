import Ludus from './env.js';
import * as errors from './errors.js';
import * as fns from './fns.js';
import * as eq from './eq.js';
import * as preds from './preds.js';
import * as spec from './spec.js';
import * as util from './util.js';

let has = (key, obj) => Object.prototype.hasOwnProperty.call(obj, key);

let merge = fns.defn({
  name: 'merge',
  doc: 'Merges objects: creates a new object with properties from all the passed in objects combined ("enumerable own properties", in JS-speak). Throws an error if any of the objects have keys duplicated between them.',
  pre: spec.splat(preds.is_obj),
  body: (...objs) => {
    let out = {};
    for (let obj of objs) {
      for (let key in obj) {
        if (!has(key, obj)) continue;
        if (key in out) throw Error(`Name conflict: ${key} is already in ${out}`);
        out[key] = obj[key];
      }
    }
    return out;
  }
});

let Prelude = Ludus.ns({
  name: 'Prelude', 
  space: merge(errors, fns, eq, spec, preds, util, {merge}, Ludus[Symbol.for('ludus/ns/space')])
});

export default Prelude;
