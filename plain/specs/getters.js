const assert = require('assert').strict;

const { parse } = require('../plain.js');

const sample = `
Field: Value
List:
- Value
- Value
Map:
Foo = Bar
Bar = Baz
Empty List:
`;

const expected = {
  map: {
    foo: 'Bar',
    bar: 'Baz'
  },
  emptyList: [],
  field: 'Value',
  list: [
    'Value',
    'Value'
  ]
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
    map: document.map('Map'),
    emptyList: document.list('Empty List'),
    field: document.field('Field'),
    list: document.list('List')
  };

  const mapResult = {
    foo: result.map.pair('Foo'),
    bar: result.map.pair('Bar')
  };

  result.map = mapResult

  assert.deepStrictEqual(result, expected);
};
