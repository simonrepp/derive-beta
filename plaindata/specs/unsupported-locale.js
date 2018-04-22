const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = 'Purpose: Assert that an error is thrown for unsupported locales';

module.exports = () => {
  const performParse = () => parse(sample, 'abcdef');
  const expectedMessage = /The requested locale "abcdef" is not supported\. Translation contributions are very welcome and an easy thing to do - only a few easy messages need to be translated!/;

  assert.throws(performParse, expectedMessage);
};
