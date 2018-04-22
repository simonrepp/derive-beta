const { errors } = require('./message-codes.js');
const { PlainDataValidationError } = require('./errors.js');
const PlainDataValue = require('./value.js');

class PlainDataSection {
  constructor(section) {
    this.context = section.context;
    this.depth = section.depth;
    this.key = section.key;
    this.keyRange = section.keyRange;
    this.parent = section.parent;

    this.range = section.range;

    if(section.lookupIndex) {
      this.lookupIndex = section.lookupIndex;
    }

    this.touched = this.key ? false : true;

    this.valuesAssociative = {};
    this.valuesSequential = [];
  }

  add(value) {
    const existingAssociative = this.valuesAssociative[value.key];

    if(existingAssociative === undefined) {
      this.valuesAssociative[value.key] = [value];
    } else {
      existingAssociative.push(value);
    }

    if(this.range.beginLine === this.keyRange.beginLine) {
      this.range.beginColumn = 0;
      this.range.beginLine = value.keyRange.beginLine;
    }

    this.range.endColumn = value.range.endColumn;
    this.range.endLine = value.range.endLine;

    this.valuesSequential.push(value);
  }

  // TODO: Configurable/overridable error message here
  // assertAllTouched(...optional) => assertAllTouched([[message,] options])
  assertAllTouched(options = {}) {
    let keys;

    if(options.only) {
      keys = options.only;
    } else {
      keys = Object.keys(this.valuesAssociative);

      if(options.except) {
        keys = keys.filter(key => !options.except.includes(key));
      }
    }

    for(let key of keys) {
      const values = this.valuesAssociative[key];

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

  // TODO: This not used yet, probably needs better usecase/specification ("mixed" ?)
  list(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_KEY,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      } else {
        return [];
      }
    }

    return values;
  }

  raw() {
    const exported = {};

    for(let key of Object.keys(this.valuesAssociative)) {
      const values = this.valuesAssociative[key];

      exported[key] = values.map(value => {
        if(value instanceof PlainDataSection) {
          return value.raw();
        }

        if(value instanceof PlainDataValue) {
          return value.get();
        }
      });
    }

    return exported;
  }

  section(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_KEY,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      } else {
        return {};
      }
    }

    if(values.length === 1) {
      const value = values[0];

      value.touch();

      if(value instanceof PlainDataSection) {
        return value;
      } else {

        // TODO: Now that we have "inline" sections ...
        //       Foo:
        //       Bar = Baz
        //       there is no telling if an empty "Foo" was really meant as:
        //       Foo:
        //       - Bar
        //       thus empty can be either value(s) or section(s) and there
        //       cannot be an error that an empty "Foo:" is not a section,
        //       because it just might be an inline section that is empy.
        //
        // TODO: This might tie in ideally with AST restructuring (also tackling value.value inconsistencies and missing parent pointer for values, etc.)

        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTION_GOT_VALUE,
          meta: { key: key },
          printRanges: [[value.range.beginLine, value.range.endLine]],
          editorRanges: [value.keyRange, value.range]
        });
      }
    }

    const ranges = new Set();
    values.forEach(value => {
      ranges.add(value.keyRange);
      ranges.add(value.range);
    });

    throw new PlainDataValidationError(this.context, {
      code: errors.validation.EXPECTED_SECTION_GOT_LIST,
      meta: { key: key },
      printRanges: [[values[0].range.beginLine, values[values.length - 1].range.endLine]],
      editorRanges: [...ranges]
    });
  }

  sections(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_KEY,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      } else {
        return [];
      }
    }

    return values.map(value => {
      value.touch();

      if(value instanceof PlainDataSection) {
        return value;
      } else {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_SECTIONS_GOT_VALUE,
          meta: { key: key },
          printRanges: [[value.range.beginLine, value.range.endLine]],
          editorRanges: [value.range]
        });
      }
    });
  }

  sequential() {
    this.valuesSequential.forEach(value => value.touch());

    return this.valuesSequential;
  }

  touch() {
    this.touched = true;
  }

  value(key, ...optional) {
    let options = { keyRequired: true, required: false, withTrace: false };
    let process = null;

    for(let argument of optional) {
      if(typeof argument === 'function') {
        process = argument;
      } else if(typeof argument === 'object') {
        Object.assign(options, argument);
      }
    }

    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_KEY,
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

    const nonEmptyValues = [];

    for(let value of values) {
      value.touch();

      if(value.value !== null) {
        nonEmptyValues.push(value);
      }
    }

    if(nonEmptyValues.length === 1) {
      const value = nonEmptyValues[0];

      if(!(value instanceof PlainDataValue)) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_VALUE_GOT_SECTION,
          meta: { key: key },
          printRanges: [[value.range.beginLine, value.range.endLine]],
          editorRanges: [value.keyRange]
        });
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

    if(nonEmptyValues.length > 1) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.EXPECTED_VALUE_GOT_VALUES,
        meta: { key: key },
        printRanges: nonEmptyValues.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: [nonEmptyValues.map(value => value.range)]
      });
    }

    if(options.required) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.MISSING_VALUE,
        meta: { key: key },
        printRanges: values.map(value => [value.range.beginLine, value.range.endLine]),
        editorRanges: values.map(value => value.range)
      });
    }

    if(options.withTrace) {
      return { trace: null, value: null };
    } else {
      return null;
    }
  }

  values(key, ...optional) {
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

    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_KEY,
          meta: { key: value.key },
          printRanges: [[this.range.beginLine, this.range.endLine]],
          editorRanges: [this.range]
        });
      }

      return [];
    }

    const results = [];

    values.forEach(value => {
      value.touch();

      if(!(value instanceof PlainDataValue)) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.EXPECTED_VALUES_GOT_SECTION,
          meta: { key: key },
          printRanges: [[value.range.beginLine, value.range.endLine]],
          editorRanges: [value.keyRange]
        });
      }

      if(options.includeEmpty || value.value !== null) {
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

        if(options.withTrace) {
          results.push({ trace: value, value: value.get() });
        } else {
          results.push(value.get());
        }
      }
    });

    if(options.exactCount !== null && results.length !== options.exactCount) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.EXACT_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.exactCount, key: key },
        printRanges: [[values[0].range.beginLine, values[values.length - 1].range.endLine]],
        editorRanges: values.map(value => value.range)
      });
    }

    if(options.minCount !== null && results.length < options.minCount) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.MIN_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.minCount, key: key },
        printRanges: [[values[0].range.beginLine, values[values.length - 1].range.endLine]],
        editorRanges: values.map(value => value.range)
      });
    }

    if(options.maxCount !== null && results.length > options.maxCount) {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.MAX_COUNT_NOT_MET,
        meta: { actual: results.length, expected: options.maxCount, key: key },
        printRanges: [[values[0].range.beginLine, values[values.length - 1].range.endLine]],
        editorRanges: values.map(value => value.range)
      });
    }

    return results;
  }
}

module.exports = PlainDataSection;
