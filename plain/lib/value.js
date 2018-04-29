const { errors } = require('./message-codes.js');
const { PlainValidationError } = require('./errors.js');

class PlainValue {
  constructor(value) {
    this.keyRange = value.keyRange;
    this.range = value.range;
    this.touched = false;
    this.value = value.value;
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

    return new PlainValidationError(this.context, error);
  }

  get() {
    this.touched = true;
    return this.value;
  }

  raw() {
    return this.value;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = PlainValue;
