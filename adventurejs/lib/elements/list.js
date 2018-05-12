const AdventureValue = require('./value.js');

class AdventureList {
  constructor(context, instruction, parent) {
    this.context = context;
    this.instruction = instruction;
    this.name = instruction.name;
    this.parent = parent;
    this.touched = false;
    this.values = [];

    for(let subinstruction of instruction.subinstructions) {
      if(subinstruction.type === 'LIST_ITEM') {
        subinstruction.element = new AdventureValue(context, subinstruction, this);
        this.values.push(subinstruction.element);
      } else {
        subinstruction.element = this;
      }
    }
  }

  inspect(indentation = '') {
    const results = [`${indentation}${this.context.messages.inspection.list} ${this.name}`];

    indentation += '  ';

    for(let value of this.values) {
      results.push(`${indentation}${this.context.messages.inspection.listItem} ${value.value}`);
    }

    return results.join('\n');
  }

  raw() {
    return this.values.map(value => value.get());
  }

  toString() {
    return this.inspect();
  }

  touch() {
    this.touched = true;

    for(let value of this.values) {
      value.touch();
    }
  }
}

module.exports = AdventureList;
