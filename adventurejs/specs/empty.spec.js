const { parse } = require('../adventure.js');

const sample = `
empty:
leer:

-

-

-

nichts:
nada:

# nothing
## none
void:
emptyness:
-- leere
-- leere

# ningun
absence:
-

-
-


non:
end:
`;

const expected = {
  empty: [null],
  leer: [[
    null,
    null,
    null
  ]],
  nothing: [{
    none: [{
      void: [null],
      emptyness: [null],
      leere: [null]
    }]
  }],
  nichts: [null],
  nada: [null],
  ningun: [{
    absence: [[
      null,
      null,
      null
    ]],
    non: [null],
    end: [null]
  }]
};

describe('Empty elements', () => {
  test('correctly parsed', () => {
    const doc = parse(sample);
    expect(doc.raw()).toEqual(expected);
  });
});
