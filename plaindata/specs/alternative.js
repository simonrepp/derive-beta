const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = `
:: key1
- value
:: list1
- value
- value
- value

:: key2

- value

:: list2

- value

- value

- value
`;

const expected = {
  'key1': [['value']],
  'list1': [[
    'value',
    'value',
    'value'
  ]],
  'key2': [['value']],
  'list2': [[
    'value',
    'value',
    'value'
  ]]
};

module.exports = () => {
  const result = parse(sample);
  assert.deepStrictEqual(result.raw(), expected);
};
