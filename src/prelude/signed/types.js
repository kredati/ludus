//////////////////// Types
// Some very basic representations of types.
// The type system for Ludus is intentionally rudimentary,
// it's meant to give users some basic categorizations
// based on affordances. But it doesn't do much beyond that.

import './env.js';
import {defn} from './functions.js';

let undef = 'undefined';
let boolean = 'boolean';
let string = 'string';
let number = 'number';
let bigint = 'bigint';
let symbol = 'symbol';
let fn = 'function';
let object = 'object';
let sequence = 'sequence';
let error = 'error';

let t = {
  undefined: undef,
  boolean,
  string,
  number,
  bigint,
  symbol,
  function: fn,
  object,
  sequence,
  error
};

let type_of = defn({
  name: 'type_of',
  doc: 'Returns a string representing the type of the value passed.',
  body: (x) => {
    let type = typeof x;
    if (type === 'object') {
      if (x instanceof Error) return error;
      if (x === null) return undef;
      if (typeof x[Symbol.iterator] === 'function')
        return sequence;
      return object;
    }
    return type;
  }
});

let create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

export {type_of, create, undef as undefined, boolean, string, number, bigint, symbol, fn as function, object, sequence, error, t};