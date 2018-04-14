const fs = require('fs');

const { parse, PlainDataParseError } = require('./plaindata.js');

// const input = fs.readFileSync('samples/', 'utf-8');

const input =
`  key:key:key:key: value:value:value: value     \n` +
`  key :key :key :key: value:value:value: value     \n` +
`  key :key :key :key    : value: value: value  : value     \n` +
`   a     : a    \n` +
` b  :b     \n` +
`    c:    c     \n` +
`  d:d     \n` +
`  e:     \n` +
`  f   :     \n` +
`  list   :     \n` +
`  -       \n` +
`-       \n` +
`    -\n`
;

let result;

try {
  result = parse(input);
} catch(err) {
  if(err instanceof PlainDataParseError) {
    console.log(err);
  } else {
    throw err;
  }
}

console.log(result);
