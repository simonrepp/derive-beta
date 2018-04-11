const expected = {
  Titel: 'Tlatelolco: Wohnblocks, Ruinen und Massaker',
  Untertitel: '»Tlatelolco«, ein Film von Lotte Schreiber',
  Bild: null,
  Autoren: ['Georg Oswald'],
  Datum: '2013-01-01',
  Sprache: 'DE',
  Kategorien: ['Besprechung', 'Film'],
  Tags: [
    'Mexiko',
    'Tlatelolco',
    'Olympische Spiele',
    'Architektur',
    'Mexico City',
    'Polizeigewalt'
  ],
  Permalink: 'tlatelolco-wohnblocks-ruinen-und-massaker',
  Buchbesprechungen: null,
  'Veröffentlichen': 'Ja',
  Lesbar: 'Ja',
  Urbanize: null,
  Abstract: null,
  Text: 'Der Stadtteil Tlatelolco ist ein Ort, ...\n...Österreich, Mexiko, 75 min',
  Literaturverzeichnis: null
};

const assert = require('assert').strict,
      fs = require('fs');

const { parse } = require('../plaindata.js');

const tlateloco = fs.readFileSync('../samples/tlateloco.plain', 'utf-8');
const result = parse(tlateloco);

assert.deepStrictEqual(result, expected);

console.log('Everything checks out.');
