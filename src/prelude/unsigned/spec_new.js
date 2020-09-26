import L from './base.js';
import P from './preds.js';

let {Type, NS} = L;

let Spec = Type.deftype({name: 'Spec'});

let def = (attrs) => Type.create(Spec, {spec: def, ...attrs});

let show = (spec) => `Spec: ${spec.name}`;

let is_valid = (spec, value) => P.bool(spec.pred(value));

let or = (...specs) => {
  let name = `or<${specs.map((s) => s.name)}>`;
  let pred = P.or(...specs.map((s) => s.pred));
  return def({name, pred, spec: or, members: specs});
};

let and = (...specs) => {
  let name = `and<${specs.map((s) => s.name)}>`;
  let pred = P.and(...specs.map((s) => s.pred));
  return def({name, pred, spec: and, members: specs});
};

let tup = (...specs) => {};

let seq = (spec) => {};

let key = (descriptor) => {};

let record = (map) => {};

export default NS.defns({type: Spec, members: {defspec: def, show}});

let str = def({name: 'str', pred: P.is_string});
let num = def({name: 'num', pred: P.is_number});

let str_or_num = or(str, num); //?
