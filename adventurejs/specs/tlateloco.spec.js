const fs = require('fs');
const path = require('path');

const { parse } = require('../adventure.js');

const input = fs.readFileSync(path.join(__dirname, './tlateloco.atxt'), 'utf-8');

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

describe('Tlateloco sample', () => {
  test('parses correctly', () => {
    const result = parse(input);

    expect(result.raw()).toEqual(expected);
  });
});
