const assert = require('assert').strict,
      fs = require('fs'),
      path = require('path');

const { parse } = require('../plain.js');

const expected = {
  Titel: ['Tlatelolco: Wohnblocks, Ruinen und Massaker'],
  Untertitel: ['»Tlatelolco«, ein Film von Lotte Schreiber'],
  Bild: [null],
  Autoren: [['Georg Oswald']],
  Datum: ['2013-01-01'],
  Sprache: ['DE'],
  Kategorien: [['Besprechung', 'Film']],
  Tags: [[
    'Mexiko',
    'Tlatelolco',
    'Olympische Spiele',
    'Architektur',
    'Mexico City',
    'Polizeigewalt'
  ]],
  Permalink: ['tlatelolco-wohnblocks-ruinen-und-massaker'],
  Buchbesprechungen: [null],
  Lesbar: ['Ja'],
  Urbanize: [null],
  Abstract: [null],
  Text: ['Der Stadtteil Tlatelolco ist ein Ort, ...\n...Österreich, Mexiko, 75 min'],
  Literaturverzeichnis: [null]
};

module.exports = () => {
  const tlateloco = fs.readFileSync(path.join(__dirname, '../samples/tlateloco.plain'), 'utf-8');
  const result = parse(tlateloco);

  assert.deepStrictEqual(result.raw(), expected);
};