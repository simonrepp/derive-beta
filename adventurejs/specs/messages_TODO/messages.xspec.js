const locales = require('../lib/locales.js');

const messageDictionary = {};
for(let locale of locales) {
  messageDictionary[locale] = require(`../lib/messages/${locale}.js`);
}

describe('Translation messages', () => {
  test('all present', () => {
    expect(document.raw()).toMatchSnapshot();
  });
});

// module.exports = () => {
//   for(let locale of locales) {
//     const messages = messageDictionary[locale];
//
//     const keysToUse = new Set();
//
//     for(let code of Object.keys(messages)) {
//       if(keysToUse.has(code)) {
//         throw `Locale ${locale} has a duplicate message entry for code ${code}`;
//       } else {
//         keysToUse.add(parseInt(code));
//       }
//     }
//
//     for(let [key, code] of Object.entries(errors.parser)) {
//       if(messages[code] === undefined) {
//         throw `Locale '${locale}' is missing the key errors.parser.${key}`;
//       } else {
//         keysToUse.delete(code);
//       }
//     }
//     for(let [key, code] of Object.entries(errors.validation)) {
//       if(messages[code] === undefined) {
//         throw `Locale '${locale}' is missing the key errors.validation.${key} `;
//       } else {
//         keysToUse.delete(code);
//       }
//     }
//
//     for(let [key, code] of Object.entries(strings)) {
//       if(messages[code] === undefined) {
//         throw `Locale '${locale}' is missing the key strings${key}`;
//       } else {
//         keysToUse.delete(code);
//       }
//     }
//
//     if(keysToUse.size > 0) {
//       throw `Locale ${locale} defines ${keysToUse.size} unused messages with codes ${[...keysToUse].join(', ')}`;
//     }
//
//   }
// };
