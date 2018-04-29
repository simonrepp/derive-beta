const { errors } = require('./message-codes.js');
const { PlainValidationError } = require('./errors.js');
const PlainMap = require('./map.js');
const PlainEmpty = require('./empty.js');
const PlainList = require('./list.js');
const PlainValue = require('./value.js');

class PlainSection {
  constructor(section) {
    if(section.context) {
      this.context = section.context;
    }

    if(section.lookupIndex) {
      this.lookupIndex = section.lookupIndex;
    }

    this.depth = section.depth;
    this.keyRange = section.keyRange;
    this.range = section.range;

    this.elementsAssociative = {};
    this.elementsSequential = [];
    this.enforcePresenceDefault = false;
    this.touched = false;
  }

  append(key, value) {
    value.key = key;
    value.context = this.context;
    value.parent = this;

    const existingAssociative = this.elementsAssociative[value.key];

    if(existingAssociative === undefined) {
      this.elementsAssociative[value.key] = [value];
    } else {
      existingAssociative.push(value);
    }

    if(this.range.beginLine === this.keyRange.beginLine) {
      this.range.beginColumn = 0;
      this.range.beginLine = value.keyRange.beginLine;
    }

    this.extendRange(value.range.endLine, value.range.endColumn);

    this.elementsSequential.push(value);
  }

  // TODO: Configurable/overridable error message here
  // assertAllTouched(...optional) => assertAllTouched([[message,] options])
  assertAllTouched(options = {}) {
    let keys;

    if(options.only) {
      keys = options.only;
    } else {
      keys = Object.keys(this.elementsAssociative);

      if(options.except) {
        keys = keys.filter(key => !options.except.includes(key));
      }
    }

    for(let key of keys) {
      const elements = this.elementsAssociative[key];

      if(elements !== undefined) {
        for(let element of elements) {
          if(!element.touched) {
            throw new PlainValidationError(this.context, {
              code: errors.validation.EXCESS_KEY,
              meta: { key: element.key },
              printRanges: [[element.keyRange.beginLine, element.keyRange.endLine]],
              editorRanges: [element.keyRange]
            });
          }

          if(element instanceof PlainSection) {
            element.assertAllTouched();
          }
        }
      }
    }
  }

  // TODO: Consider going from '*-key' terminology to '*-name', especially in public facing lingo this is cool because:
  // "Each (Section or Map) Attribute has a name and a value"
  // "Each List has a name and values"
  // "Each Section has a name"
  // "Each Map has a name"
  //  .. This is much clearer to non-technical persons than "key" everywhere
  field(key, ...optional) {
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

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.enforcePresence) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.MISSING_FIELD,
          meta: { key: key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      // TODO: A trace to a missing key is not really sensible i guess, consider how to deal with this
      if(options.withTrace) {
        return { trace: null, value: null };
      } else {
        return null;
      }
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainMap) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_FIELD_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainList) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_FIELD_GOT_LIST,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainSection) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_FIELD_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }
    }

    if(elements.length === 1) {
      const element = elements[0];

      if(element instanceof PlainEmpty || element.value === null) {
        if(options.required) {
          throw new PlainValidationError(this.context, {
            code: errors.validation.MISSING_FIELD,
            meta: { key: key },
            printRanges: [[element.range.beginLine, element.range.endLine]],
            editorRanges: [element.range]
          });
        }

        // TODO: A trace to a missing key is not really sensible i guess, consider how to deal with this
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
          throw new PlainValidationError(this.context, {
            message: message,
            printRanges: [[element.range.beginLine, element.range.endLine]],
            editorRanges: [element.range]
          });
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
      throw new PlainValidationError(this.context, {
        code: errors.validation.EXPECTED_FIELD_GOT_MULTIPLE_FIELDS,
        meta: { key: key },
        printRanges: elements.map(element => [element.range.beginLine, element.range.endLine]),
        editorRanges: elements.map(element => element.range) // TODO: Should be the full ranges i guess
      });
    }
  }

  map(key, ...optional) {
    let options = { enforcePresence: this.enforcePresenceDefault };

    for(let argument of optional) {
      if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.enforcePresence) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.MISSING_COLLECTION,
          meta: { key: key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      return null;
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainList) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_LIST,
          meta: { key: key },
          printRanges: element.values.map(value => [value.range]),
          editorRanges: element.values.map(value => value.range)
        });
      }

      if(element instanceof PlainSection) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Should be full range / key & value
        });
      }

      if(element instanceof PlainValue) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_FIELD,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.range]
        });
      }
    }

    if(elements.length === 1) {
      const element = elements[0];

      if(element instanceof PlainEmpty) {
        // TODO: Construct PlainMap from PlainEmpty, or make the empty behave like a map, and return it
        return null;
      }

      return element;
    }

    if(elements.length > 1) {
      throw new PlainValidationError(this.context, {
        code: errors.validation.EXPECTED_COLLECTION_GOT_COLLECTIONS,
        meta: { key: key },
        printRanges: elements.map(element => [element.keyRange.beginLine, element.range.endLine]),
        editorRanges: elements.map(element => element.range) // TODO: Should be full range / key & value
      });
    }
  }

  // TODO: This not used yet, needs usecase/specification
  // mixed(key) {
  //   const values = this.elementsAssociative[key];
  //
  //
  //   return values;
  // }

  enforcePresence(enforce) {
    this.enforcePresenceDefault = enforce;

    for(let element of this.elementsSequential) {
      if(element instanceof PlainMap ||
         element instanceof PlainSection) {
        element.enforcePresence(enforce);
      }
    }
  }

  extendRange(line, column) {
    this.range.endColumn = column;
    this.range.endLine = line;

    if(this.parent) {
      this.parent.extendRange(line, column);
    }
  }

  list(key, ...optional) {
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

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.enforcePresence) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.MISSING_LIST,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      return [];
    }

    const results = [];

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainList ||
         element instanceof PlainValue) {


        const valueElements = element instanceof PlainList ? element.values :
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
                throw new PlainValidationError(this.context, {
                  message: message,
                  printRanges: [[value.range.beginLine, value.range.endLine]],
                  editorRanges: [value.range]
                });
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

      if(element instanceof PlainMap) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_LIST_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainSection) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_LIST_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }
    }

    if(options.exactCount !== null && results.length !== options.exactCount) {
      throw new PlainValidationError(this.context, {
        code: errors.validation.EXACT_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.exactCount, key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]), // Possibly directly pass ranges and let line-printer.js extract the beginLine/endLine itself (unless there needs to be manual picking between begin and end, only possible issue! check :)
        editorRanges: results.map(value => value.range)
      });
    }

    if(options.minCount !== null && results.length < options.minCount) {
      throw new PlainValidationError(this.context, {
        code: errors.validation.MIN_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.minCount, key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: results.map(value => value.range)
      });
    }

    if(options.maxCount !== null && results.length > options.maxCount) {
      throw new PlainValidationError(this.context, {
        code: errors.validation.MAX_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.maxCount, key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: results.map(value => value.range)
      });
    }

    return results;
  }

  raw() {
    const exported = {};

    for(let key of Object.keys(this.elementsAssociative)) {
      const elements = this.elementsAssociative[key];
      exported[key] = elements.map(element => element.raw());
    }

    return exported;
  }

  section(key, ...optional) {
    let options = { enforcePresence: this.enforcePresenceDefault };

    for(let argument of optional) {
      if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.enforcePresence) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.MISSING_SECTION,
          meta: { key: key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      } else {
        return null;
      }
    }

    // TODO: For each value store the representational type as well ? (e.g. string may come from "- foo" or -- foo\nxxx\n-- foo) and used that for precise error messages?

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainMap) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainEmpty) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_EMPTY,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }

      if(element instanceof PlainList) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_LIST,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }

      if(element instanceof PlainValue) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_FIELD,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ! like the printRange basically - from key up to last value
        });
      }
    }

    if(elements.length === 1) {
      return elements[0];
    }

    // TODO: Maybe a differentation range / keyRange / valueRange makes sense too? where the first contains the two following

    throw new PlainValidationError(this.context, {
      code: errors.validation.EXPECTED_SECTION_GOT_SECTIONS,
      meta: { key: key },
      printRanges: elements.map(element => [element.keyRange.beginLine, element.range.endLine]),
      editorRanges: elements.map(element => element.range)
    });
  }

  sections(key) {
    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      return [];
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainMap) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainEmpty) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_EMPTY,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainList) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_LIST,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }

      if(element instanceof PlainValue) {
        throw new PlainValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_FIELD,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
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

module.exports = PlainSection;
