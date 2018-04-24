const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = `
Field: Value
List:
- Value
- Value
Collection:
Foo = Bar
Bar = Baz
Empty List:
`;

const expected = {
  collection: {
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
    collection: document.collection('Collection'),
    emptyList: document.list('Empty List'),
    field: document.attribute('Field'),
    list: document.list('List')
  };

  const collectionResult = {
    foo: result.collection.attribute('Foo'),
    bar: result.collection.attribute('Bar')
  };

  result.collection = collectionResult

  assert.deepStrictEqual(result, expected);
};
