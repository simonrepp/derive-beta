const fs = require('fs'),
      path = require('path');

const { parse, PlainDataParseError } = require('./plaindata.js');

const input = fs.readFileSync(path.join(__dirname, 'samples/spec.plain'), 'utf-8');

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
