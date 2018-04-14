const fs = require('fs');

const { parse, PlainDataParseError } = require('./plaindata.js');

const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Veranstaltungen/Urbanize 2012/Die Stadt filmen – von unten.plain', 'utf-8');

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
