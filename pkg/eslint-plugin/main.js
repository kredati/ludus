'use strict';

const import_modules = require('import-modules');
const create_index = require('create-eslint-index');

const rules = import_modules('rules', {camelize: false});

const external = {
  'no-var': 'error',
  'no-console': 'error'
};

const internal = create_index.createConfig({
  plugin: 'ludus',
  field: 'meta.docs.recommended',
}, rules);

module.exports = {
  rules,
  configs: {
    recommended: {
      rules: Object.assign({}, internal, external)
    }
  }
};