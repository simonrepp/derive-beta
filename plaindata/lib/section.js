const { errors } = require('./message-codes.js');
const { PlainDataValidationError } = require('./errors.js');
const PlainDataCollection = require('./collection.js');
const PlainDataList = require('./list.js');
const PlainDataValue = require('./value.js');

class PlainDataSection {
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

    this.touched = false;

    this.elementsAssociative = {};
    this.elementsSequential = [];
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
      const values = this.elementsAssociative[key];

      if(values !== null) {
        for(let value of values) {
          if(!value.touched) {
            throw new PlainDataValidationError(this.context, {
              code: errors.validation.EXCESS_KEY,
              meta: { key: value.key },
              printRanges: [[value.keyRange.beginLine, value.keyRange.endLine]],
              editorRanges: [value.keyRange]
            });
          }

          if(value instanceof PlainDataSection) {
            value.assertAllTouched();
          }
        }
      }
    }
  }

  // TODO: Consider going from '*-key' terminology to '*-name', especially in public facing lingo this is cool because:
  // "Each (Section or Collection) Attribute has a name and a value"
  // "Each List has a name and values"
  // "Each Section has a name"
  // "Each Collection has a name"
  //  .. This is much clearer to non-technical persons than "key" everywhere
  attribute(key, ...optional) {
    let options = { keyRequired: true, required: false, withTrace: false };
    let process = null;

    for(let argument of optional) {
      if(typeof argument === 'function') {
        process = argument;
      } else if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_FIELD,
          meta: { key: key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      if(options.withTrace) {
        return { trace: null, value: null };
      } else {
        return null;
      }
    }

    const results = [];
    const nonEmptyResults = [];

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainDataCollection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_ATTRIBUTE_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataSection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_ATTRIBUTE_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }

      const values = element instanceof PlainDataList ? element.values : [element];

      for(let value of values) {
        results.push(value);

        if(value.value !== null) {
          nonEmptyResults.push(value);
        }
      }
    }

    if(nonEmptyResults.length === 1) {
      const value = nonEmptyResults[0];

      if(process) {
        try {
          const processed = process(value);

          if(options.withTrace) {
            return { trace: value, value: processed };
          } else {
            return processed;
          }
        } catch(message) {
          throw new PlainDataValidationError(this.context, {
            message: message,
            printRanges: [[value.range.beginLine, value.range.endLine]],
            editorRanges: [value.range]
          });
        }
      }

      // TODO: Resolve ambiguity between value and value.value ? valueNode vs value ? node vs value ? pairs ? assignments ? association ?

      if(options.withTrace) {
        return { trace: value, value: value.get() };
      } else {
        return value.get();
      }
    }

    if(nonEmptyResults.length > 1) {
      console.log(results);
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.EXPECTED_ATTRIBUTE_GOT_LIST,
        meta: { key: key },
        printRanges: nonEmptyResults.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: nonEmptyResults.map(value => value.range)
      });
    }

    if(options.required) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.MISSING_FIELD,
        meta: { key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: results.map(value => value.range)
      });
    }

    if(options.withTrace) {
      return { trace: null, value: null };
    } else {
      return null;
    }
  }

  collection(key, ...optional) {
    let options = { keyRequired: true };

    for(let argument of optional) {
      if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_COLLECTION,
          meta: { key: key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      return {}; // TODO: Or should this return null? hm! :)
    }

    for(let element of elements) {
      element.touch();

      // TODO: An empty collection registers as an empty PlainDataValue,
      //       this triggers a validation error here - in error - so that
      //       means we either manually check for null - meh - or better,
      //       we introduce a PlainDataEmpty type that covers this :)

      if(element instanceof PlainDataValue) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_ATTRIBUTE,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Should be full range / key & value
        });
      }

      // TODO: There is an ambiguity:
      //       Multiple multiline values count as multiple attributes,
      //       somehow they are a list though as soon as there 2, beacuse they have no syntactical distinction.

      if(element instanceof PlainDataList) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_LIST,
          meta: { key: key },
          printRanges: element.values.map(value => [value.range]),
          editorRanges: element.values.map(value => value.range)
        });
      }

      if(element instanceof PlainDataSection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_COLLECTION_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Should be full range / key & value
        });
      }
    }

    if(elements.length === 1) {
      return elements[0];
    }

    if(elements.length > 1) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.EXPECTED_COLLECTION_GOT_COLLECTIONS,
        meta: { key: key },
        printRanges: elements.map(element => [element.keyRange.beginLine, element.range.endLine]),
        editorRanges: elements.map(element => element.range) // TODO: Should be full range / key & value
      });
    }

    return {}; // TODO: Or should this return null? hm! :)
  }

  // TODO: This not used yet, needs usecase/specification
  // mixed(key, options = { keyRequired: true }) {
  //   const values = this.elementsAssociative[key];
  //
  //   if(values === undefined) {
  //     if(options.keyRequired) {
  //       throw new PlainDataValidationError(this.context, {
  //         code: errors.validation.MISSING_GENERIC_FOO,
  //         meta: { key: value.key },
  //         printRanges: [[this.range.beginLine, this.range.endLine]],
  //         editorRanges: [this.range]
  //       });
  //     } else {
  //       return [];
  //     }
  //   }
  //
  //   return values;
  // }

  extendRange(line, column) {
    this.range.endColumn = column;
    this.range.endLine = line;

    if(this.parent) {
      this.parent.extendRange(line, column);
    }
  }

  list(key, ...optional) {
    let options = {
      exactCount: null,
      includeEmpty: false,
      keyRequired: true,
      maxCount: null,
      minCount: null,
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

    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_LIST,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      return [];
    }

    const results = [];

    // TODO: values => can be Section Attribute(s), List(s), Collection(s), Section(s)
    //       Some other terminology than value would be super cool, e.g. elements ? (here is good, consider everywhere)
    for(let element of elements) {
      element.touch();

      if(element instanceof PlainDataCollection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_LIST_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataSection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_LIST_GOT_SECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }

      const values = element instanceof PlainDataList ? element.values : [element];

      for(let value of values) {
        if(options.includeEmpty || value.value !== null) {
          if(process) {
            try {
              const processed = process(value);

              if(options.withTrace) {
                results.push({ trace: value, value: processed });
              } else {
                results.push(processed);
              }
            } catch(message) {
              throw new PlainDataValidationError(this.context, {
                message: message,
                printRanges: [[value.range.beginLine, value.range.endLine]],
                editorRanges: [value.range]
              });
            }
          }

          if(options.withTrace) {
            results.push({ trace: value, value: value.get() });
          } else {
            results.push(value.get());
          }
        }
      }
    }

    if(options.exactCount !== null && results.length !== options.exactCount) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.EXACT_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.exactCount, key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]), // Possibly directly pass ranges and let line-printer.js extract the beginLine/endLine itself (unless there needs to be manual picking between begin and end, only possible issue! check :)
        editorRanges: results.map(value => value.range)
      });
    }

    if(options.minCount !== null && results.length < options.minCount) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.MIN_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.minCount, key: key },
        printRanges: results.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: results.map(value => value.range)
      });
    }

    if(options.maxCount !== null && results.length > options.maxCount) {
      throw new PlainDataValidationError(this.context, {
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

  // process possibilty to consume tree? maybe chained as function?
  section(key, options = { keyRequired: true }) {
    const elements = this.elementsAssociative[key];

    if(elements === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_SECTION,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      } else {
        return {}; // TODO: Strictly speaking this should be null I guess ? {} is definitely wrong in any case.
                   //       We could also construct a virtual section and return it
                   //       (because the calls on section for values still need to work)
                   //       but consider if that is a good idea first, in all aspects :)
      }
    }

    for(let element of elements) {
      element.touch();

      if(element instanceof PlainDataValue) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_ATTRIBUTE,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataCollection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataList) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_LIST,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
        });
      }
    }

    if(elements.length === 1) {
      return elements[0];
    }

    // TODO: Maybe a differentation range / keyRange / valueRange makes sense too? where the first contains the two following

    throw new PlainDataValidationError(this.context, {
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

      if(element instanceof PlainDataValue) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_ATTRIBUTE,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataCollection) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_COLLECTION,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange] // TODO: Needs a custom range ? like the printRange basically - from key up to last value
        });
      }

      if(element instanceof PlainDataList) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_LIST,
          meta: { key: key },
          printRanges: [[element.keyRange.beginLine, element.range.endLine]],
          editorRanges: [element.keyRange]
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

module.exports = PlainDataSection;
