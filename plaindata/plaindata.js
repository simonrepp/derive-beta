// const PlainDataDumper = require('./lib/dumper.js');
const PlainDataParser = require('./lib/parser.js');
const { PlainDataParseError, PlainDataValidationError } = require('./lib/errors.js');
const locales = require('./lib/locales.js');

// TODO: Parser/Dumper vs Decoder/Encoder ?

// exports.dump = object => {
//
//   // TODO: Validate it's an object here ? (or insider dumper?)
//
//   const dumper = new PlainDataDumper(input, locale);
// };

exports.parse = (input, locale = 'en') => {

  // TODO: Validate input here ? (if it's a string)

  if(!locales.includes(locale)) {
    throw new RangeError(
      `The requested locale "${locale}" is not supported. Translation contributions are ` +
      `very welcome and an easy thing to do - only a few easy messages need ` +
      `to be translated!`
    );
  }

  const parser = new PlainDataParser(input, locale);

  return parser.run();
};

exports.PlainDataParseError = PlainDataParseError;
exports.PlainDataValidationError = PlainDataValidationError;
