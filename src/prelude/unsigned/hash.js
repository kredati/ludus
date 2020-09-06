//////////////////// HashedMap
// A wrapper around JS's map that works on value, not reference,
// equality. It uses a string hash of an object or array, represented
// with a BigInt, to index reference types. It also handles potential
// collisions by falling back on `eq`. It is not clear to me how often
// collisions will or can occur.

import {eq} from './eq.js';

// First, a HashError class that only exists in HashedMap, for to
// not swallow any other errors thrown here, in case I wrote bad code.
class HashError extends Error {};

// Arbitrarily chosen prime numbers in the 10^4 range(ish)
// which will serve as multipliers based on various types.
let primes = {
  undefined: 1607n,
  boolean: 1409n,
  string: 4421n,
  number: 3187n,
  symbol: 2801n,
  object: 911n,
  function: 1279n,
  bigint: 2083n
};

// hash :: (string) -> bigint
// Hashes a string; a variant of Java's algorithm.
let hash = (str) => {
  let hash = 0;
  for (let char of str) {
      let code = char.codePointAt(0);
      hash = (hash << 5) - hash + code | 0;
  }
  return BigInt(hash);
};

// A series of hash functions that multiple string representations
// of various types by prime numbers.
let hash_string = (str) => hash(str) * primes.string; 

let hash_number = (n) => hash(String(n)) * primes.number;

let hash_symbol = (s) => hash(s.descriptor) * primes.symbol;

let hash_bool = (b) => hash(String(b)) + primes.boolean;

let undef_hash = hash(String('undefined')) * primes.undefined;

let hash_undef = () => undef_hash;

let null_hash = hash(String('null')) * primes.undefined;

let hash_fn = (fn) => hash(fn.name || 'anonymous') * primes.function;

let hash_bigint = (n) => hash(String(n)) * primes.bigint;

// A map of hash functions that correspond to the string types returned
// by typeof.
let hash_fns = {
  string: hash_string,
  number: hash_number,
  symbol: hash_symbol,
  boolean: hash_bool,
  function: hash_fn,
  undefined: hash_undef,
  bigint: hash_bigint
};

// hash_object :: (obj) -> bigint
// Creates a hash for an object. It creates a string representation of
// an object and munges it. Runs recursively on everything in the object.
// It is O(n) to the size of the object. Size isn't just the # of keys.
// It may take much longer if the values in the object are themselves
// collections.
let hash_object = (obj) => {
  if (obj === null) return null_hash;
  let hash = 1n;
  for (let key of Reflect.ownKeys(obj)) {
    let entry = obj[key];
    let entry_type = typeof entry;
    if (!entry_type in hash_fns) 
      throw HashError(`HashedMap does not know how to generate a hash for ${obj.toString}`);
    
    let entry_hash = hash_fns[entry_type](entry);
    hash = (hash_string(key) * entry_hash) + hash;
  }
  return hash;
};

hash_fns.object = hash_object;

// Takes a key of any type, and returns a unique key for it.
// Reference types with value equality (objects but not functions)
// are hashed.
let get_key = (key) => typeof key === 'object'
  ? hash_object(key)
  : key;

///// HashedMap
// Forgive the `class`; it was the easiest way.
// HashedMap is a Map which intervenes Map's methods to achieve value-equality
// for its keys.
// HashedMap does *not* allow for reassigment of identical keys: it is an
// append-only structure. Nevertheless, it *is* mutating. Its only use in
// Ludus is in multimethods.
class HashMap extends Map {
  constructor () {
    super();
  }

  // returns true if the HM contains the key
  // dispatches to `get` so I don't have to recreate the
  // logic.
  has (key) {
    if (this.get(key) === undefined) return false;
    return true;
  }

  // sets a value/key pair
  // it does this by storing an array at a bigint hash value,
  // which contains the key/value pairs directly
  // this lets us manage collisions
  // also, while HashMaps will happily store a value at `undefined` 
  // as a key, they will not allow `undefined` to be stored as
  // a value.
  set (key, value) {
    if (value == undefined)
      throw Error('HashMaps cannot store `undefined` as a value.');
    let hashed = get_key(key);
    if (super.has(hashed)) {
      let entries = super.get(hashed);
      for (let i = 0; i < entries.length; i++) {
        let [key_, value_] = entries[i];
        if (eq(key, key_)) {
          throw Error(`HashedMap already contains an entry for ${key}: ${value_.toString()}.`)
        }
      }
      console.warn(`Collision! On ${hashed}. Offending keys:
      ${[...key, entries.map(([k]) => k).join('/n      ')]}`);
      entries.push(key, value);
      return this;
    }
    return super.set(hashed, [[key, value]]);
  }

  // gets a value: first, it gets a hash, then it extracts
  // the corresponding value from the array, or `undefined`
  get (key) {
    let hashed = get_key(key);
    let entries = super.get(hashed);
    if (entries == null) return undefined;
    for (let [key_, value] of entries) {
      if (eq(key, key_)) return value;
    }
    return undefined;
  }

  delete () {
    throw Error('Cannot delete keys from a HashedMap.')
  }

  clear () {
    throw Error('Cannot clear a HashedMap.')
  }

};

export {HashMap, HashError};
