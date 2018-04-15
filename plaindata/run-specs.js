const alternative = require('./specs/alternative.js'),
      dashes = require('./specs/dashes.js'),
      empty = require('./specs/empty.js'),
      tlateloco = require('./specs/tlateloco.js'),
      unsupportedLocale = require('./specs/unsupported-locale.js'),
      whitespace = require('./specs/whitespace.js');

console.time('specs');

alternative();
dashes();
empty();
tlateloco();
whitespace();
unsupportedLocale();

console.timeEnd('specs');
console.log('Everything fine');
