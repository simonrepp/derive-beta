const fs = require('fs');

const { parse, AdventureParseError, AdventureValidationError } = require('./adventure.js');

// const input = fs.readFileSync('/home/simon/derive/derive-beta/adventure/latest-spec/essence_by_example.atxt', 'utf-8');

const input = `
# default
## a
value_1: default
## b
value_1: default
value_2: default

# shallow < default
## b
value_1: shallow

# deep << default
## a
## b
value_1: deep
`;

const doc = parse(input, 'de', 'terminal');

console.log(doc.section('shallow').raw());

// console.log(document);

// console.log(document.raw());
// console.log(document.list('Tags'));
// console.log(document.section('Command'));
// console.log(document.field('Command', { withTrace: true }));

// const specific = document.map('Funky').entry('Business');
// const specific = document.list('Frogs');
// console.log(specific);
