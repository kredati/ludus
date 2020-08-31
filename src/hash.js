import {eq} from './equality.js';

let primes = {
  undefined: 1607n,
  boolean: 1409n,
  string: 4421n,
  number: 3187n,
  symbol: 2801n,
  object: 911n,
  function: 1279n
};

let hash = (str) => {
  let hash = 0;
  for (let char of str) {
      let code = char.charCodeAt(0);
      hash = (hash << 5) - hash + code | 0;
  }
  return BigInt(hash);
};

let hash_string = (str) => hash(str) * primes.string; 

let hash_number = (n) => hash(String(n)) * primes.number;

let hash_symbol = (s) => hash(s.descriptor) * primes.symbol;

let hash_bool = (b) => hash(String(b)) + primes.boolean;

let undef_hash = hash(String('undefined')) * primes.undefined;

let hash_undef = () => undef_hash;

let null_hash = hash(String('null')) * primes.undefined;

let hash_fn = (fn) => hash(fn.name || 'anonymous') * primes.function;

let hash_fns = {
  string: hash_string,
  number: hash_number,
  symbol: hash_symbol,
  boolean: hash_bool,
  function: hash_fn,
  undefined: hash_undef
};

let hash_object = (obj) => {
  if (obj === null) return null_hash;
  let hash = 1n;
  for (let key of Reflect.ownKeys(obj)) {
    let entry = obj[key];
    let entry_type = typeof entry;
    if (!entry_type in hash_fns) 
      throw Error('Unknown hash type.');
    
    let entry_hash = hash_fns[entry_type](entry);
    hash = (hash_string(key) * entry_hash) + hash;
  }
  return hash;
};

hash_fns.object = hash_object;


let map = new Map();

let get_key = (x) => {
  if (x == null) return x;
  switch(x.constructor) {
    case Number:
    case Boolean:
    case String:
    case Symbol:
      return x;
    default:
      return hash_object(x);
  }
};

let set = (key, value) => map.set(get_key(key), value);

class HashedMap extends Map {
  constructor () {
    super();
  }

  has (key) {
    return super.has(get_key(key));
  }

  set (key, value) {
    let hashed = get_key(key);
    if (super.has(hashed)) {
      let entries = super.get(hashed);
      for (let i = 0; i < entries.length; i++) {
        let [key_] = entries[i];
        if (eq(key, key_)) {
          entries[i] = [key, value];
          return this;
        }
      }
      console.warn(`Collision! On ${key} // ${hashed}`);
      entries.push(key, value);
      return this;
    }
    return super.set(hashed, [[key, value]]);
  }

  get (key) {
    let hashed = get_key(key);
    let entries = super.get(hashed);
    if (entries == null) return undefined;
    entries
    for (let [key_, value] of entries) {
      if (eq(key, key_)) return value;
    }
    return undefined;
  }
};

let c = () => {};
let h = new HashedMap(); //?
h.set({a: 1, b: [1, 2, 'foo'], c}, 42);
h
h.get({a: 1, b: [1, 2, 'foo']}); //?
h.get({b: [1, 2, 'foo'], a: 1, c}) //?

h.set([1, 2, 3], 12)
h.get([1, 2, 3]) //?
h