// const AdventureBuilder = require('./lib/builder.js');
const AdventureParser = require('./lib/parser.js');
const { AdventureParseError, AdventureValidationError } = require('./lib/errors.js');

const locales = ['de', 'en'];

// TODO: Parser and Builder (no generic dumper concept exists in plain)

// TODO: - Pass default loaders to parse(..), which are always run when getting any values from the resulting document (e.g. ERB default loader to interpolate things)
//       - Generally enable possiblity to run multiple loaders in order (then you can also pass multiple loaders to the individual getters e.g.)

const build = object => {

  if(typeof object !== 'object') {
    throw new TypeError(
      `The builder accepts only objects as input, input was: ${object}`
    );
  }

//   const builder = new AdventureDumper(input, locale);
};

const parse = (input, locale = 'en') => {

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

  const parser = new AdventureParser(input, locale);

  return parser.run();
};

module.exports = {
  AdventureParseError,
  AdventureValidationError,
  build,
  parse
};
