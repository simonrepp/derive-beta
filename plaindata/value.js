const { PlainDataError } = require('./errors.js');
const snippet = require('./snippet.js');

class PlainValue {
  constructor(value) {
    this.context = value.context;
    this.key = value.key;
    this.keyRange = value.keyRange;
    this.range = value.range;
    this.touched = false;
    this.value = value.value;
  }

  error(message) {
    if(message === undefined) {
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

  getLazy() {
    this.touched = true;

    return this;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = PlainValue;
