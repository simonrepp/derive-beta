const { parse } = require('../adventure.js');

const sample = `
# default
## a
value_1: default
## b
value_1: default
value_2: default

# shallow < default
## b
value_1: shallow

# deep << default
## a
## b
value_1: deep
`;

describe('Section copy operators', () => {
  const doc = parse(sample);

  test('Default section is correctly initialized', () => {
    const _default = doc.section('default').raw();

    expect(_default).toEqual({
      a: [{
        value_1: ['default']
      }],
      b: [{
        value_1: ['default'],
        value_2: ['default']
      }]
    });
  });

  test('Shallow section is correctly merged', () => {
    const shallow = doc.section('shallow').raw();

    expect(shallow).toEqual({
      a: [{
        value_1: ['default']
      }],
      b: [{
        value_1: ['shallow']
      }]
    });
  });

  test('Shallow section is correctly merged', () => {
    const deep = doc.section('deep').raw();

    expect(deep).toEqual({
      a: [{
        value_1: ['default']
      }],
      b: [{
        value_1: ['deep'],
        value_2: ['default']
      }]
    });
  });
});
