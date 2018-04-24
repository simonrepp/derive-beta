// const PlainDataDumper = require('./lib/dumper.js');
const PlainDataParser = require('./lib/parser.js');
const { PlainDataParseError, PlainDataValidationError } = require('./lib/errors.js');
const locales = require('./lib/locales.js');

// TODO: Parser/Dumper vs Decoder/Encoder ?

// TODO: - Pass default loaders to parse(..), which are always run when getting any values from the resulting document (e.g. ERB default loader to interpolate things)
//       - Genereally enable possiblity to run multiple loaders in order (then you can also pass multiple loaders to the individual getters e.g.)
//       - Make reference definition dictionary globally available to loaders ? (in order to eg. interpolate variables from there)


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
