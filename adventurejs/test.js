const fs = require('fs');

const { parse, AdventureParseError, AdventureValidationError } = require('./adventure.js');

// const input = fs.readFileSync('/home/simon/derive/derive-beta/adventure/latest-spec/essence_by_example.atxt', 'utf-8');

const input = `
empty:

traits:
eyes=blue
collar=red
`;

const doc = parse(input, 'de', 'terminal');

console.log(doc.raw());
console.log(doc.field('empty').toString());

// console.log(document);

// console.log(document.raw());
// console.log(document.list('Tags'));
// console.log(document.section('Command'));
// console.log(document.field('Command', { withTrace: true }));

// const specific = document.map('Funky').entry('Business');
// const specific = document.list('Frogs');
// console.log(specific);
