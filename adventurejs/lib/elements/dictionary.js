const AdventureValue = require('./value.js');
const errors = require('../errors/validation.js');

class AdventureDictionary {
  constructor(context, instruction, parent) {
    this.context = context;
    this.instruction = instruction;
    this.name = instruction.name;
    this.parent = parent;

    this.entries = {};
    this.enforcePresenceDefault = false;
    this.touched = false;

    for(let subinstruction of instruction.subinstructions) {
      if(subinstruction.type === 'DICTIONARY_ENTRY') {
        subinstruction.element = new AdventureValue(context, subinstruction, this);
        this.entries[subinstruction.name] = subinstruction.element;
      } else {
        subinstruction.element = this;
      }
    }
  }

  entry(name, ...optional) {
    let options = {
      enforcePresence: this.enforcePresenceDefault,
      required: false,
      withTrace: false
    };
    let process = null;

    for(let argument of optional) {
      if(typeof argument === 'function') {
        process = argument;
      } else if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const value = this.entries[name];

    if(value === undefined) {
      if(options.enforcePresence) {
        errors.missingDictionaryEntry(this.context, name, this.instruction);
      }

      if(options.withTrace) {
        return { trace: null, value: null };
      } else {
        return null;
      }
    }

    if(value.value === null) {
      if(options.required) {
        errors.missingDictionaryEntry(this.context, name, this.instruction);
      }

      if(options.withTrace) {
        return { trace: null, value: null };
      } else {
        return null;
      }
    }

    if(process) {
      try {
        const processed = process(value);

        if(options.withTrace) {
          return { trace: value, value: processed };
        } else {
          return processed;
        }
      } catch(message) {
        errors.valueError(this.context, message, element.instruction);
      }
    }

    if(options.withTrace) {
      return { trace: value, value: value.get() };
    } else {
      return value.get();
    }
  }

  enforcePresence(enforce) {
    this.enforcePresenceDefault = enforce === undefined ? true : enforce;
  }

  raw() {
    const exported = {};

    for(let name of Object.keys(this.entries)) {
      exported[name] = this.entries[name].get();
    }

    return exported;
  }
  touch() {
    this.touched = true;
  }
}

module.exports = AdventureDictionary;
