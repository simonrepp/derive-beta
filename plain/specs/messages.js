const { errors, strings } = require('../lib/message-codes.js');
const locales = require('../lib/locales.js');

const messageDictionary = {};
for(locale of locales) {
  messageDictionary[locale] = require(`../lib/messages/${locale}.js`);
}

// TODO: Reconsider if the whole enum with ints is really the way to go
//       could use string keys just as well i guess, as long as the specs ensure correctness

module.exports = () => {
  for(locale of locales) {
    const messages = messageDictionary[locale];

    const keysToUse = new Set();

    for(let code of Object.keys(messages)) {
      if(keysToUse.has(code)) {
        throw `Locale ${locale} has a duplicate message entry for code ${code}`;
      } else {
        keysToUse.add(parseInt(code));
      }
    }

    for(let [key, code] of Object.entries(errors.parser)) {
      if(messages[code] === undefined) {
        throw `Locale '${locale}' is missing the key errors.parser.${key}`;
      } else {
        keysToUse.delete(code);
      }
    }
    for(let [key, code] of Object.entries(errors.validation)) {
      if(messages[code] === undefined) {
        throw `Locale '${locale}' is missing the key errors.validation.${key} `;
      } else {
        keysToUse.delete(code);
      }
    }

    for(let [key, code] of Object.entries(strings)) {
      if(messages[code] === undefined) {
        throw `Locale '${locale}' is missing the key strings${key}`;
      } else {
        keysToUse.delete(code);
      }
    }

    if(keysToUse.size > 0) {
      throw `Locale ${locale} defines ${keysToUse.size} unused messages with codes ${[...keysToUse].join(', ')}`;
    }

  }
};
