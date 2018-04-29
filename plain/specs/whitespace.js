const assert = require('assert').strict;

const { parse } = require('../plain.js');

const sample =
`  key1:value:value:value: value:value:value: value     \n` +
`  key2 :value :value :value: value:value:value: value     \n` +
`  key3  :value  :value  :value    : value: value: value  : value     \n` +
`   a     : a    \n` +
` b  :b     \n` +
`    c:    c     \n` +
`  d:d     \n` +
`  e:     \n` +
`  f   :     \n` +
`  list1   :     \n` +
`  -       \n` +
`-       \n` +
`    -\n` +
`  list2:list:list:list:listlist:list::list     \n`
;

const expected = {
  'key1': ['value:value:value: value:value:value: value'],
  'key2': ['value :value :value: value:value:value: value'],
  'key3': ['value  :value  :value    : value: value: value  : value'],
  'a': ['a'],
  'b': ['b'],
  'c': ['c'],
  'd': ['d'],
  'e': [null],
  'f': [null],
  'list1': [[
    null,
    null,
    null
  ]],
  'list2': ['list:list:list:listlist:list::list']
};

module.exports = () => {
  const result = parse(sample);
  assert.deepStrictEqual(result.raw(), expected);
};
