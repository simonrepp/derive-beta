const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = `
list -:
- -
- --
- ---
:: -
- -
list --:
- ---
- --
- -
--- ---
--- --
--- ---
list ---:
- ---
- ---
- ---
:: --
- --
# ----
:: ---
- ---
`;

const expected = {
  'list -': [[
    '-',
    '--',
    '---'
  ]],
  '-': [['-']],
  'list --': [[
    '---',
    '--',
    '-'
  ]],
  '---': ['--- --'],
  'list ---': [[
    '---',
    '---',
    '---'
  ]],
  '--': [['--']],
  '----': [{
    '---': [['---']]
  }]
};

module.exports = () => {
  const result = parse(sample);
  assert.deepStrictEqual(result.raw(), expected);
};
