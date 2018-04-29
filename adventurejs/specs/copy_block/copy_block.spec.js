const fs = require('fs');
const path = require('path');

const { parse, AdventureParseError, AdventureValidationError } = require('../../adventure.js');

const input = fs.readFileSync(path.join(__dirname, 'copy_block.ad'), 'utf-8');

describe('Copying a block', () => {
  test('succeeds', () => {
    const document = parse(input);
    expect(document.raw()).toMatchSnapshot();
  });
});
