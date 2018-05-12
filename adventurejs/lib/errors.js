class AdventureError extends Error {
  constructor(text, snippet, selection, cursor) {
    super(`${text}\n\n${snippet}`);

    this.cursor = cursor;
    this.selection = selection;
    this.snippet = snippet;
    this.text = text;

    // TODO: Dynamically enable only in a node environment
    // Error.captureStackTrace(this, AdventureError);
  }

  cursor() {
    return this.selection ? this.selection[0] : null;
  }
}

class AdventureParseError extends AdventureError {
  constructor(...args) {
    super(...args);

    // TODO: Dynamically enable only in a node environment
    // Error.captureStackTrace(this, AdventureParseError);
  }
}

class AdventureValidationError extends AdventureError {
  constructor(...args) {
    super(...args);

    // TODO: Dynamically enable only in a node environment
    // Error.captureStackTrace(this, AdventureValidationError);
  }
}

module.exports = {
  AdventureParseError,
  AdventureValidationError
};
