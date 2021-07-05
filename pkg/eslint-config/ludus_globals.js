/* eslint-disable */
let Ludus = require("@ludus/prelude/ludus_globals.json");

let globals = Object.fromEntries(
  Ludus.map(key => [key, 'readonly']));

module.exports = {
  globals
};