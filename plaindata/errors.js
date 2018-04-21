// TODO: Error implementation refinements ? regarding output (toString() ? standard print behaviour to console when not catching?)

const localizedMessages = {
  de: require('./messages/de.js'),
  en: require('./messages/en.js')
};

const PlainDataLinePrinter = require('./line-printer.js');

class PlainDataError extends Error {
  constructor(context, error) {
    super();

    const messages = localizedMessages[context.locale];
    const printer = new PlainDataLinePrinter(context.lines, messages);

    if(error.code) {
      this.message = messages[error.code](error.meta);
    } else {
      this.message = error.message;
    }

    this.snippet = printer.print(error.printRanges);
    this.ranges = error.editorRanges || [];

    Error.captureStackTrace(this, PlainDataValidationError);
  }
}

class PlainDataParseError extends PlainDataError {
  constructor(context, error) {
    super(context, error);

    Error.captureStackTrace(this, PlainDataParseError);
  }
}

class PlainDataValidationError extends PlainDataError {
  constructor(context, error) {
    super(context, error);

    Error.captureStackTrace(this, PlainDataValidationError);
  }
}


module.exports = {
  PlainDataParseError: PlainDataParseError,
  PlainDataValidationError: PlainDataValidationError
};
