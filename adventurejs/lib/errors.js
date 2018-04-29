class AdventureError extends Error {
  constructor(text, snippet, selection, cursor) {
    super(`${text}\n\n${selection}\n\n${snippet}`);

    this.cursor = cursor;
    this.selection = selection;
    this.snippet = snippet;
    this.text = text;

    Error.captureStackTrace(this, AdventureError);
  }
}

class AdventureParseError extends AdventureError {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, AdventureParseError);
  }
}

class AdventureValidationError extends AdventureError {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, AdventureValidationError);
  }
}

module.exports = {
  AdventureParseError,
  AdventureValidationError
};
