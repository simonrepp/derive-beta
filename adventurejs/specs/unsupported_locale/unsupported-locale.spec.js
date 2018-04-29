const { parse } = require('../../adventure.js');

describe('Unsupported locale', () => {
  test('throws', () => {
    expect(() => parse('', 'abcdef')).toThrowErrorMatchingSnapshot();
  });
});
