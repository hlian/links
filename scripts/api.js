require('flow-remove-types/register');
// eslint-disable-next-line no-global-assign
require = require('esm')(module);
module.exports = require('../src/api/index.js');
