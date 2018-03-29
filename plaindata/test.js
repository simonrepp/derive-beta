const fs = require('fs');

const { parse, PlainDataParseError } = require('./plaindata.js');

const input = fs.readFileSync('samples/23.plain', 'utf-8');

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
