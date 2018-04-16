const fs = require('fs'),
      path = require('path');

const { parse, PlainDataParseError } = require('./plaindata-rich-parser.js');

const input = fs.readFileSync(path.join(__dirname, 'samples/simple.plain'), 'utf-8');

let result;

try {
  result = parse(input, { locale: 'de' });
} catch(err) {
  if(err instanceof PlainDataParseError) {
    console.log(err, 'yea');
  } else {
    throw err;
  }
}

try {
  const gotten = result.getList('Titel');
  const gotten2 = result.getSection('Titel');

  console.log(gotten);
} catch(err) {
  console.log(err);
}

// radio.title = validateString(document, 'Titel', { required: true });
// radio.info = validateMarkdown(document, 'Allgemeine Info', { required: true });
// radio.editors = { sourced: validateArray(document, 'Redaktion') };
//
// validateKeys(document, ['Allgemeine Info', 'Redaktion', 'Titel']);
