const { PlainDataError } = require('./errors.js');
const snippet = require('./snippet.js');

class PlainValue {
  constructor(value) {
    this.context = value.context;
    this.key = value.key;
    this.keyRange = value.keyRange;
    this.value = value.value;
    this.valueRange = value.valueRange;
  }

  error(message) {
    if(message === undefined) {
      message = this.context.messages.validation.genericError(this.key);
    }

    return new PlainDataError(
      message,
      snippet(this.context.lines, this.valueRange.beginLine, this.valueRange.endLine),
      [this.valueRange]
    );
  }
}

module.exports = PlainValue;
