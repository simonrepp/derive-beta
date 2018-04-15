const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = 'Purpose: Assert that an error is thrown for unsupported locales';

module.exports = () => {
  const performParse = () => parse(sample, { locale: 'unsupported' });
  const expectedMessage = /The provided message locale requested through the parser options is not supported/;

  assert.throws(performParse, expectedMessage);
};
