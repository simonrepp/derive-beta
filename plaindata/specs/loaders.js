const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = `
Field: Value
List:
- Value
- Value
Empty List:
`;

const expected = {
  field: 'Value of Field',
  list: [
    'Value inside a List',
    'Value inside a List'
  ],
  emptyList: []
};

const fieldLoader = ({ key, value }) => {
  return `${value} of ${key}`;
};

const listLoader = ({ key, value }) => {
  return `${value} inside a ${key}`;
};

module.exports = () => {
  const document = parse(sample);

  const result = {
    field: document.attribute('Field', fieldLoader),
    list: document.list('List', listLoader),
    emptyList: document.list('Empty List', listLoader)
  };

  assert.deepStrictEqual(result, expected);
};
