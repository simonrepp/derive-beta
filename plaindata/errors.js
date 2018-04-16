// TODO: Error implementation refinements ? regarding output

class PlainDataError extends Error {
  constructor(message, metadata) {
    super(message);

    Object.keys(metadata).forEach(key => {
      this[key] = metadata[key];
    });

    Error.captureStackTrace(this, PlainDataError);
  }
}

class PlainDataParseError extends Error {
  constructor(message, metadata) {
    super(message);

    Object.keys(metadata).forEach(key => {
      this[key] = metadata[key];
    });

    Error.captureStackTrace(this, PlainDataParseError);
  }
}

module.exports = {
  PlainDataError: PlainDataError,
  PlainDataParseError: PlainDataParseError
};
