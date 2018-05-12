const nodeEnviroment = () => {
  try {
    return this === global;
  } catch(e) {
    return false;
  }
};

class AdventureError extends Error {
  constructor(text, snippet, selection, cursor) {
    super(`${text}\n\n${snippet}`);

    this.cursor = cursor;
    this.selection = selection;
    this.snippet = snippet;
    this.text = text;

    if(nodeEnviroment()) {
      Error.captureStackTrace(this, AdventureError);
    }
  }

  cursor() {
    return this.selection ? this.selection[0] : null;
  }
}

class AdventureParseError extends AdventureError {
  constructor(...args) {
    super(...args);

    if(nodeEnviroment()) {
      Error.captureStackTrace(this, AdventureParseError);
    }
  }
}

class AdventureValidationError extends AdventureError {
  constructor(...args) {
    super(...args);

    if(nodeEnviroment()) {
      Error.captureStackTrace(this, AdventureValidationError);
    }
  }
}

module.exports = {
  AdventureParseError,
  AdventureValidationError
};
