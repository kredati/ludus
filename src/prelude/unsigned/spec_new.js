import L from './base.js';
import P from './preds.js';

let {Type, NS} = L;

let Spec = Type.deftype({name: 'Spec'});

let def = (attrs) => Type.create(Spec, {spec: def, ...attrs});

let rename = (name, spec) => Object.defineProperty(spec, 'name', {value: name});

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

let tup = (...specs) => {
  let name = `tup<${specs.map((s) => s.name)}>`;
  let pred = (tup) => {
    if (specs.length !== tup.length) return false;
    for (let i = 0; i < specs.length; i++) {
      if (!is_valid(specs[i], tup[i])) return false;
    }
    return true;
  };
  return def({name, pred, spec: tup, members: specs});
};

let seq = (spec) => {
  let name = `seq<${spec.name}>`;
  let pred = (seq) => {
    for (let el of seq) {
      if (!is_valid(spec, el)) return false;
    }
    return true;
  }
  return def({name, pred, spec: seq, members: spec});
};

let key = (descriptor) => {
  let [the_key] = Object.keys(descriptor);
  let name = `key<${the_key}>`;
  let pred = (obj) => is_valid(descriptor[the_key], obj[the_key]);
  return def({name, pred, spec: key, members: descriptor});
};

let record = (descriptor) => {
  let [name] = Object.keys(descriptor);
  let d_map = descriptor[name];
  let map = Object.keys(d_map).reduce(
    (m, k) => { m[k] = key({[k]: d_map[k]}); return m; },
    {}
  );
  let keys = Object.values(map);
  let spec = and(...keys);
  return rename(name, spec);
};

export default NS.defns({type: Spec, members: {defspec: def, show}});

