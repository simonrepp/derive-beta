const fs = require('fs');

const { parse, PlainDataParseError, PlainDataValidationError } = require('./plaindata.js');

// const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Festival/Festival.plain', 'utf-8');
// const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Zeitschriften/10.plain', 'utf-8');
const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Akteure/0/50 Hz.plain', 'utf-8');

let document;

try {
  document = parse(input, 'de');

  console.log(document.raw());
  console.log(document.list('Tags'));
  // console.log(document.section('Command'));
  // console.log(document.attribute('Command', { withTrace: true }));

  // const specific = document.collection('Funky').attribute('Business');
  // // const specific = document.list('Frogs');
  // console.log(specific);
} catch(err) {
  if(err instanceof PlainDataParseError || err instanceof PlainDataValidationError) {
    console.log(`${err.message}\n\n${err.snippet}\n\n${err.ranges}`);
  } else {
    throw err;
  }
}
