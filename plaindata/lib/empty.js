const { errors } = require('./message-codes.js');
const { PlainDataValidationError } = require('./errors.js');

class PlainDataEmpty {
  constructor(value) {
    this.keyRange = value.keyRange;
    this.range = value.range;
    this.touched = false;
  }

  getError(customMessage) {
    const error = {
      printRanges: [[this.range.beginLine, this.range.endLine]],
      editorRanges: [this.range]
    };

    if(customMessage) {
      if(typeof customMessage === 'function') {
        error.message = customMessage(this);
      } else {
        error.message = customMessage;
      }
    } else {
      error.code = errors.validation.GENERIC_ERROR;
      error.meta = { key: this.key };
    }

    return new PlainDataValidationError(this.context, error);
  }

  get() {
    this.touched = true;
    return null;
  }

  raw() {
    return null;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = PlainDataEmpty;
