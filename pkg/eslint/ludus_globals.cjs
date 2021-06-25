/* eslint-disable */
//const ludus = require('@ludus/prelude');

let globals = Object.fromEntries(
  Object.keys({foo: 42, bar: 23})
    .map(key => [key, 'readonly']));

module.exports = {
  globals
};