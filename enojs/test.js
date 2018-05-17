// const fs = require('fs');
//
const { parse, EnoParseError, EnoValidationError } = require('./eno.js');
//
// // const input = fs.readFileSync('/home/simon/derive/derive-beta/eno/latest-spec/essence_by_example.atxt', 'utf-8');
//
// const input = `
// empty:
//
// traits:
// eyes=blue
// collar=red
// `;
//
// const doc = parse(input, 'de', 'terminal');
//
// console.log(doc.raw());
// console.log(doc.field('empty').toString());
//
// // console.log(document);
//
// // console.log(document.raw());
// // console.log(document.list('Tags'));
// // console.log(document.section('Command'));
// // console.log(document.field('Command', { withTrace: true }));
//
// // const specific = document.map('Funky').entry('Business');
// // const specific = document.list('Frogs');
// // console.log(specific);

const sample = `
bad coordinates: Mickey Mouse
good coordinates: 48.211180, 16.371514
`;

const loadCoordinates = ({ name, value }) => {
  const split = value.split(',');

  if(split.length < 2) {
    throw `${name} should have a lat and a lng!`;
  }

  return {
    lat: parseFloat(split[0]),
    lng: parseFloat(split[1])
  };
};

const doc = parse(sample);

console.log(doc.field('bad coordinates', loadCoordinates, { required: true }))
