/* eslint-disable */
//const ludus = require('');

let globals = Object.fromEntries(
  Object.keys({foo: 42, bar: 23})
    .map(key => [key, 'readonly']));

module.exports = {
  globals
};