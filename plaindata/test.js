const fs = require('fs');

const { parse, PlainDataParseError, PlainDataValidationError } = require('./plaindata.js');

const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Zeitschriften/10.plain', 'utf-8');

let result;

try {
  result = parse(input, 'de');

  const specific = result.collection('Funky').attribute('Business');
  // const specific = result.list('Frogs');
  console.log(specific);
} catch(err) {
  if(err instanceof PlainDataParseError || err instanceof PlainDataValidationError) {
    console.log(`${err.message}\n\n${err.snippet}\n\n${err.ranges}`);
  } else {
    throw err;
  }
}
