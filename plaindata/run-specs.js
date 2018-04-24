const alternative = require('./specs/alternative.js'),
      dashes = require('./specs/dashes.js'),
      empty = require('./specs/empty.js'),
      getters = require('./specs/getters.js'),
      loaders = require('./specs/loaders.js'),
      messages = require('./specs/messages.js'),
      tlateloco = require('./specs/tlateloco.js'),
      unsupportedLocale = require('./specs/unsupported-locale.js'),
      whitespace = require('./specs/whitespace.js');

console.time('specs');

alternative();
dashes();
empty();
getters();
loaders();
messages();
tlateloco();
whitespace();
unsupportedLocale();

console.timeEnd('specs');
console.log('Everything fine');
