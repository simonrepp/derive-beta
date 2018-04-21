const fs = require('fs'),
      path = require('path');

const { parse, PlainDataParseError } = require('./plaindata.js');
const { PlainDataError } = require('./errors.js');

// const input = fs.readFileSync(path.join(__dirname, '/home/simon/derive/publish.derive.at/public/export/full_database/Radio/Radio.plain'), 'utf-8');
const input = fs.readFileSync('/home/simon/derive/publish.derive.at/public/export/full_database/Zeitschriften/10.plain', 'utf-8');

let result;

try {
  result = parse(input, { locale: 'de' });

  const specific = result.section('Funky').value('Businessy');
  console.log(specific);
} catch(err) {
  if(err instanceof PlainDataParseError || err instanceof PlainDataError) {
    console.log(`${err.message}\n\n${err.snippet}\n\n${err.ranges}`);
  } else {
    throw err;
  }
}

// const raw = result.raw();
// console.log(raw);



// try {
//   const gotten = result.getList('Titel');
//   const gotten2 = result.getSection('Titel');
//
//   console.log(gotten);
// } catch(err) {
//   console.log(err);
// }

// radio.title = validateString(document, 'Titel', { required: true });
// radio.info = validateMarkdown(document, 'Allgemeine Info', { required: true });
// radio.editors = { converted: validateArray(document, 'Redaktion') };
//
// validateKeys(document, ['Allgemeine Info', 'Redaktion', 'Titel']);
