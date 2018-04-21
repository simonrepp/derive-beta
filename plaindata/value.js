const { PlainDataError } = require('./errors.js');
const PlainDataLinePrinter = require('./line-printer.js');

class PlainDataValue {
  constructor(value) {
    this.context = value.context;
    this.key = value.key;
    this.keyRange = value.keyRange;
    this.range = value.range;
    this.touched = false;
    this.value = value.value;

    this.printer = new PlainDataLinePrinter(this.context.lines, this.context.messages);
  }

  error(customMessage) {
    let message;

    if(customMessage) {
      if(typeof customMessage === 'function') {
        message = customMessage(this);
      } else {
        message = customMessage;
      }
    } else {
      message = this.context.messages.validation.genericError(this.key);
    }

    return new PlainDataError(
      message,
      snippet(this.context.lines, this.range.beginLine, this.range.endLine),
      [this.range]
    );
  }

  get() {
    this.touched = true;
    return this.value;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = PlainDataValue;
