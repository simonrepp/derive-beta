const errors = require('../errors/validation.js');

class AdventureEmpty {
  constructor(context, instruction, parent) {
    this.context = context;
    this.name = instruction.name;
    this.parent = parent;
    this.touched = false;
  }

  getError(message) {
    return errors.fabricateValueError(
      this.context,
      message,
      this.instruction
    );
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

module.exports = AdventureEmpty;
