// const PlainDataDumper = require('./lib/dumper.js');
const PlainDataParser = require('./lib/parser.js');
const { PlainDataParseError, PlainDataValidationError } = require('./lib/errors.js');
const locales = require('./lib/locales.js');

// TODO: Parser/Dumper vs Decoder/Encoder ?

exports.dump = object => {

  if(typeof object !== 'object') {
    throw new TypeError(
      `The dumper accepts only objects as input, input was: ${object}`
    );
  }

//   const dumper = new PlainDataDumper(input, locale);
};

exports.parse = (input, locale = 'en') => {

  if(typeof input !== 'string') {
    throw new TypeError(
      `The parser accepts only strings as input, input was: ${input}`
    );
  }

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
