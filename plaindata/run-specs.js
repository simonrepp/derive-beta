const alternative = require('./specs/alternative.js'),
      dashes = require('./specs/dashes.js'),
      empty = require('./specs/empty.js'),
      tlateloco = require('./specs/tlateloco.js'),
      whitespace = require('./specs/whitespace.js');

// TODO: More specs

console.time('specs');

alternative();
dashes();
empty();
tlateloco();
whitespace();

console.timeEnd('specs');
console.log('Everything fine');
