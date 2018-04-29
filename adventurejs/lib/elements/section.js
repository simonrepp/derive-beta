const errors = require('../errors/validation.js');
const AdventureDictionary = require('./dictionary.js');
const AdventureEmpty = require('./empty.js');
const AdventureList = require('./list.js');
const AdventureValue = require('./value.js');

class AdventureSection {
  constructor(context, instruction, parent) {
    this.context = context;
    this.instruction = instruction;
    this.name = instruction.name;
    this.parent = parent;

    this.elementsAssociative = {};
    this.elementsSequential = [];
    this.enforcePresenceDefault = false;
    this.touched = false;

    const append = element => {
      this.elementsSequential.push(element);
      const existingAssociative = this.elementsAssociative[element.name];

      if(existingAssociative === undefined) {
        this.elementsAssociative[element.name] = [element];
      } else {
        existingAssociative.push(element);
      }
    };

    for(let subinstruction of instruction.subinstructions) {
      if(subinstruction.type === 'COMMENT' || subinstruction.type === 'EMPTY') {
        subinstruction.element = this;
        continue;
      }

      if(subinstruction.type === 'NAME') {
        subinstruction.element = new AdventureEmpty(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }

      if(subinstruction.type === 'FIELD') {
        subinstruction.element = new AdventureValue(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }

      if(subinstruction.type === 'LIST') {
        subinstruction.element = new AdventureList(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }

      if(subinstruction.type === 'BLOCK') {
        subinstruction.element = new AdventureValue(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }

      if(subinstruction.type === 'DICTIONARY') {
        subinstruction.element = new AdventureDictionary(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }

      if(subinstruction.type === 'SECTION') {
        subinstruction.element = new AdventureSection(context, subinstruction, this);
        append(subinstruction.element);
        continue;
      }
    }
  }

  // TODO: Configurable/overridable error message here
  // assertAllTouched(...optional) => assertAllTouched([[message,] options])
  assertAllTouched(options = {}) {
    let names;

    if(options.only) {
      names = options.only;
    } else {
      names = Object.keys(this.elementsAssociative);

      if(options.except) {
        names = names.filter(name => !options.except.includes(name));
      }
    }

    for(let name of names) {
      const elements = this.elementsAssociative[name];

      if(elements !== undefined) {
        for(let element of elements) {
          if(!element.touched) {
            errors.excessName(this.context, element.instruction);
          }

          // TODO: Also for dictionary? Also callable directly on dictionary then, for more granular assertions on user side
          if(element instanceof AdventureSection) {
            element.assertAllTouched();
          }
        }
      }
    }
  }

  dictionary(name, ...optional) {
    let options = { enforcePresence: this.enforcePresenceDefault };

    for(let argument of optional) {
      if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[name];

    if(elements === undefined) {
      if(options.enforcePresence) {
        errors.missingDictionary(this.context, name, this);
      }

      return null;
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof AdventureList) {
        errors.expectedDictionaryGotList(this.context, element.instruction);
      }

      if(element instanceof AdventureSection) {
        errors.expectedDictionaryGotSection(this.context, element.instruction);
      }

      if(element instanceof AdventureValue) {
        errors.expectedDictionaryGotField(this.context, element.instruction);
      }
    }

    if(elements.length === 1) {
      const element = elements[0];

      if(element instanceof AdventureEmpty) {
        // TODO: Construct AdventureDictionary from AdventureEmpty, or make the empty behave like a map, and return it
        return null;
      }

      return element;
    }

    if(elements.length > 1) {
      errors.expectedDictionaryGotDictionaries(
        this.context,
        elements.map(element => element.instruction)
      );
    }
  }

  // TODO: This not used yet, needs usecase/specification
  // mixed(name) {
  //   const values = this.elementsAssociative[name];
  //
  //
  //   return values;
  // }

  enforcePresence(enforce) {
    this.enforcePresenceDefault = enforce === undefined ? true : enforce;

    for(let element of this.elementsSequential) {
      if(element instanceof AdventureDictionary ||
         element instanceof AdventureSection) {
        element.enforcePresence(enforce);
      }
    }
  }

  field(name, ...optional) {
    let options = {
      enforcePresence: this.enforcePresenceDefault,
      required: false,
      withTrace: false
    };
    let loader = null;

    for(let argument of optional) {
      if(typeof argument === 'function') {
        loader = argument;
      } else if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[name];

    if(elements === undefined) {
      if(options.enforcePresence) {
        errors.missingField(this.context, name, this.instruction);
      }

      // TODO: A trace to a missing name is not really sensible i guess, consider how to deal with this
      if(options.withTrace) {
        return { trace: null, value: null };
      } else {
        return null;
      }
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof AdventureDictionary) {
        errors.expectedFieldGotDictionary(this.context, element.instruction);
      }

      if(element instanceof AdventureList) {
        errors.expectedFieldGotList(this.context, element.instruction);

      }

      if(element instanceof AdventureSection) {
        errors.expectedFieldGotSection(this.context, element.instruction);
      }
    }

    if(elements.length === 1) {
      const element = elements[0];

      if(element instanceof AdventureEmpty || element.value === null) {
        if(options.required) {
          errors.missingField(this.context, name, this.instruction);
        }

        // TODO: A trace to a missing name is not really sensible i guess, consider how to deal with this
        //       => We could put the trace on the parent element !?
        if(options.withTrace) {
          return { trace: null, value: null };
        } else {
          return null;
        }
      }

      if(loader) {
        try {
          const processed = loader(element);

          if(options.withTrace) {
            return { trace: element, value: processed };
          } else {
            return processed;
          }
        } catch(message) {
          errors.valueError(this.context, message, element.instruction);
        }
      }

      // TODO: Resolve ambiguity between value and value.value ? valueNode vs value ? node vs value ? pairs ? assignments ? association ?

      if(options.withTrace) {
        return { trace: element, value: element.get() };
      } else {
        return element.get();
      }
    }

    if(elements.length > 1) {
      errors.expectedFieldGotMultipleFields(
        this.context,
        name,
        elements.map(element => element.instruction)
      );
    }
  }

  list(name, ...optional) {
    let options = {
      enforcePresence: this.enforcePresenceDefault,
      exactCount: null,
      includeEmpty: false,
      maxCount: null,
      minCount: null,
      withTrace: false
    };

    let loader = null;

    for(let argument of optional) {
      if(typeof argument === 'function') {
        loader = argument;
      } else if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[name];

    if(elements === undefined) {
      if(options.enforcePresence) {
        errors.missingList(this.context, name, this.instruction);
      }

      return [];
    }

    const results = [];

    for(let element of elements) {
      element.touch();

      if(element instanceof AdventureList ||
         element instanceof AdventureValue) {

        const valueElements = element instanceof AdventureList ? element.values :
                                                                 [element];

        for(let value of valueElements) {
          if(options.includeEmpty || value.value !== null) {
            if(loader) {
              try {
                const processed = loader(value);

                if(options.withTrace) {
                  results.push({ trace: value, value: processed });
                } else {
                  results.push(processed);
                }
              } catch(message) {
                errors.valueError(this.context, message, value.instruction);
              }

              continue;
            }

            if(options.withTrace) {
              results.push({ trace: value, value: value.get() });
            } else {
              results.push(value.get());
            }
          }
        }
      }

      if(element instanceof AdventureDictionary) {
        errors.expectedListGotDictionary(this.context, element.instruction);
      }

      if(element instanceof AdventureSection) {
        errors.expectedListGotSection(this.context, element.instruction);
      }
    }

    if(options.exactCount !== null && results.length !== options.exactCount) {
      errors.exactCountNotMet(this.context,
                              name,
                              results.map(value => value.instruction),
                              options.exactCount,
                              this);
    }

    if(options.minCount !== null && results.length < options.minCount) {
      errors.minCountNotMet(this.context,
                            name,
                            results.map(value => value.instruction),
                            options.minCount,
                            this);
    }

    if(options.maxCount !== null && results.length > options.maxCount) {
      errors.maxCountNotMet(this.context,
                            name,
                            results.map(value => value.instruction),
                            options.minCount,
                            this);
    }

    return results;
  }

  lookup(line, column) {
    const instruction = this.context.instructions.find(instruction => {
      return instruction.lineNumber === line;
    });

    if(instruction) {
      const result = {
        element: instruction.element,
        zone: 'element'
      };

      if(instruction.ranges) {
        for(let [type, range] of Object.entries(instruction.ranges)) {
          if(column >= range[0] && column <= range[1]) {
            result.zone = type;
            break;
          }
        }
      }

      return result;
    }

    return null;
  }

  raw() {
    const exported = {};

    for(let name of Object.keys(this.elementsAssociative)) {
      const elements = this.elementsAssociative[name];
      exported[name] = elements.map(element => element.raw());
    }

    return exported;
  }

  section(name, ...optional) {
    let options = { enforcePresence: this.enforcePresenceDefault };

    for(let argument of optional) {
      if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[name];

    if(elements === undefined) {
      if(options.enforcePresence) {
        errors.missingSection(this.context, name, this);
      }

      return null;
    }

    // TODO: For each value store the representational type as well ? (e.g. string may come from "- foo" or -- foo\nxxx\n-- foo) and use that for precise error messages?

    for(let element of elements) {
      element.touch();

      if(element instanceof AdventureDictionary) {
        errors.expectedSectionGotDictionary(this.context, element.instruction);
      }

      if(element instanceof AdventureEmpty) {
        errors.expectedSectionGotEmpty(this.context, element.instruction);
      }

      if(element instanceof AdventureList) {
        errors.expectedSectionGotList(this.context, element.instruction);
      }

      if(element instanceof AdventureValue) {
        errors.expectedSectionGotField(this.context, element.instruction);
      }
    }

    if(elements.length === 1) {
      return elements[0];
    }

    // TODO: Maybe a differentation range / nameRange / valueRange makes sense too? where the first contains the two following

    error.expectedSectionGotSections(this.context, name, elements.map(element => element.instruction));
  }

  sections(name) {
    const elements = this.elementsAssociative[name];

    if(elements === undefined) {
      return [];
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof AdventureDictionary) {
        errors.expectedSectionsGotDictionary(this.context, element.instruction);
      }

      if(element instanceof AdventureEmpty) {
        errors.expectedSectionsGotEmpty(this.context, element.instruction);

      }

      if(element instanceof AdventureList) {
        errors.expectedSectionsGotList(this.context, element.instruction);
      }

      if(element instanceof AdventureValue) {
        errors.expectedSectionsGotField(this.context, element.instruction);
      }
    }

    return elements;
  }

  sequential() {
    this.elementsSequential.forEach(element => element.touch());

    return this.elementsSequential;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = AdventureSection;
