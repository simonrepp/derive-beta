const AdventureValue = require('./value.js');

class AdventureList {
  constructor(context, instruction, parent) {
    this.context = context;
    this.instruction = instruction;
    this.name = instruction.name;
    this.parent = parent;
    this.touched = false;
    this.items = [];

    instruction.element = this;

    for(let subinstruction of instruction.subinstructions) {
      if(subinstruction.type === 'LIST_ITEM') {
        subinstruction.element = new AdventureValue(context, subinstruction, this);
        this.items.push(subinstruction.element);
      } else {
        subinstruction.element = this;
      }
    }
  }

  get [Symbol.toStringTag]() {
    return 'EnoList';
  }

  explain(indentation = '') {
    const results = [`${indentation}${this.name}`];

    indentation += '  ';

    for(let item of this.items) {
      results.push(`${indentation}${item.value}`);
    }

    return results.join('\n');
  }

  raw() {
    return { [this.name]: this.items.map(item => item.get()) };
  }

  toString() {
    return `[Object EnoList name="${this.name}" length="${this.items.length}"]`;
  }

  touch() {
    this.touched = true;

    for(let item of this.items) {
      item.touch();
    }
  }
}

module.exports = AdventureList;
