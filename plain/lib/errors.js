// TODO: Error implementation refinements ? regarding output (toString() ? standard print behaviour to console when not catching?)

const localizedMessages = {
  de: require('./messages/de.js'),
  en: require('./messages/en.js')
};

const PlainLinePrinter = require('./line-printer.js');

class PlainError extends Error {
  constructor(context, error) {
    super();

    const messages = localizedMessages[context.locale];
    const printer = new PlainLinePrinter(context.lines, messages);

    if(error.code) {
      this.message = messages[error.code](error.meta);
    } else {
      this.message = error.message;
    }

    this.snippet = printer.print(error.printRanges);
    this.ranges = error.editorRanges || [];

    Error.captureStackTrace(this, PlainValidationError);
  }
}

class PlainParseError extends PlainError {
  constructor(context, error) {
    super(context, error);

    Error.captureStackTrace(this, PlainParseError);
  }
}

class PlainValidationError extends PlainError {
  constructor(context, error) {
    super(context, error);

    Error.captureStackTrace(this, PlainValidationError);
  }
}


module.exports = {
  PlainParseError: PlainParseError,
  PlainValidationError: PlainValidationError
};
