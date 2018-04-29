const { parse } = require('../adventure.js');

describe.skip('Unicode special characters', () => {
  test('Line separator is handled correctly', () => {
    const doc = parse(`Unicode line separator: Here it comes   that was it`);
    expect(doc.raw()).toEqual({ 'Unicode line separator': `Here it comes   that was it`});
  });
});
