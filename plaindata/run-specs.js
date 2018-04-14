const dashes = require('./specs/dashes.js'),
      empty = require('./specs/empty.js'),
      tlateloco = require('./specs/tlateloco.js'),
      whitespace = require('./specs/whitespace.js');

// TODO: More specs

console.time('specs');

dashes();
empty();
tlateloco();
whitespace();

console.timeEnd('specs');
console.log('Everything fine');
