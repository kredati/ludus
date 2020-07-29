import {n_ary, partial} from './fn.js'

let boolean = x => x == null || x === false ? false : true;

let is_nullish = x => x == null;

let when_nullish = n_ary('when_nullish',
  (if_nullish) => partial(when_nullish, if_nullish),
  (if_nullish, value) => value == null ? if_nullish : value
);

let get = n_ary('get',
  (key) => partial(get, key),
  (key, obj) => get(key, obj, null),
  (key, obj, if_absent) => obj == null 
    ? if_absent 
    : when_nullish(null, obj[key])
);

let get_in = n_ary('get_in',
  (obj) => partial(get_in, obj),
  (obj, keys) => get_in(obj, keys, null),
  (obj, keys, if_absent) => keys.reduce((o, k) => get(k, o, if_absent), obj)
);

export {get, get_in, boolean, is_nullish, when_nullish};