const errors = require('../errors/validation.js');

class AdventureValue {
  constructor(context, instruction, parent) {
    this.context = context;
    this.instruction = instruction;
    this.name = instruction.name;
    this.parent = parent;
    this.value = instruction.value || null;
    this.touched = false;

    if(instruction.subinstructions) {
      for(let subinstruction of instruction.subinstructions) {
        subinstruction.element = this;

        if(subinstruction.type === 'FIELD_APPEND') {
          if(this.value === null) {
            this.value = subinstruction.value;
          } else {
            this.value += subinstruction.separator + subinstruction.value;
          }
          continue;
        }

        if(subinstruction.type === 'BLOCK_CONTENT') {
          if(this.value === null) {
            this.value = subinstruction.line;
          } else {
            this.value += '\n' + subinstruction.line;
          }
          continue;
        }
      }
    }
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
    return this.value;
  }

  raw() {
    return this.value;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = AdventureValue;
