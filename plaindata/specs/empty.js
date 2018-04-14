const assert = require('assert').strict;

const { parse } = require('../plaindata.js');

const sample = `
empty:
leer:

-

-

-

nichts:
-- nada

# nothing
## none
void:
emptyness:
--- leere
--- leere

# ningun
absence:
-

-
-


-- non
end:
`;

const expected = {
  empty: null,
  leer: [
    null,
    null,
    null
  ],
  nichts: null,
  nada: null,
  nothing: {
    none: {
      void: null,
      emptyness: null,
      leere: null
    }
  },
  ningun: {
    absence: [
      null,
      null,
      null
    ],
    non: null,
    end: null
  }
};

module.exports = () => {
  const result = parse(sample);
  assert.deepStrictEqual(result, expected);
};
