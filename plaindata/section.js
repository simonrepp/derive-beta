const { PlainDataError } = require('./errors.js');
const PlainDataValue = require('./value.js');
const PlainDataLinePrinter = require('./line-printer.js');

class PlainDataSection {
  constructor(section) {
    this.context = section.context;
    this.depth = section.depth;
    this.key = section.key;
    this.keyRange = section.keyRange;
    this.parent = section.parent;

    this.printer = new PlainDataLinePrinter(this.context.lines, this.context.messages);

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
            throw new PlainDataError(
              this.context.messages.validation.excessKey(value.key),
              this.printer.print(value.keyRange.beginLine, value.keyRange.endLine),
              [value.keyRange]
            );
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
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          this.printer.print(this.range.beginLine, this.range.endLine),
          [this.range]
        );
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
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          this.printer.print(this.range.beginLine, this.range.endLine),
          [this.range]
        );
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

        throw new PlainDataError(
          this.context.messages.validation.expectedSectionGotValue(key),
          this.printer.print(value.range.beginLine, value.range.endLine),
          [value.keyRange, value.range]
        );
      }
    }

    const ranges = new Set();
    values.forEach(value => {
      ranges.add(value.keyRange);
      ranges.add(value.range);
    });

    throw new PlainDataError(
      this.context.messages.validation.expectedSectionGotList(key),
      this.printer.print(values[0].range.beginLine, values[values.length - 1].range.endLine),
      [...ranges]
    );
  }

  sections(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          this.printer.print(this.range.beginLine, this.range.endLine),
          [this.range]
        );
      } else {
        return [];
      }
    }

    return values.map(value => {
      value.touch();

      if(value instanceof PlainDataSection) {
        return value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedSectionsGotValue(key),
          this.printer.print(value.range.beginLine, value.range.endLine),
          [value.range]
        );
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
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          this.printer.print(this.range.beginLine, this.range.endLine),
          [this.range]
        );
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
        throw new PlainDataError(
          this.context.messages.validation.expectedValueGotSection(key),
          this.printer.print(value.range.beginLine, value.range.endLine),
          [value.keyRange]
        );
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
          throw new PlainDataError(
            message,
            this.printer.print(value.range.beginLine, value.range.endLine), // TODO: Consider split between .parser and .messages ?
            [value.range]
          );
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
      // TODO: Esp. for this usecase, consider snippet() accepting multiple line ranges too
      throw new PlainDataError(
        this.context.messages.validation.expectedValueGotValues(key),
        this.printer.print(nonEmptyValues[0].range.beginLine, nonEmptyValues[nonEmptyValues.length - 1].range.endLine),
        nonEmptyValues.map(value => value.range)
      );
    }

    if(options.required) {
      // TODO: Also for this usecase, consider snippet() accepting multiple line ranges too
      throw new PlainDataError(
        this.context.messages.validation.missingValue(key),
        this.printer.print(values[0].range.beginLine, values[values.length - 1].range.endLine),
        values.map(value => value.range)
      );
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
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          this.printer.print(this.range.beginLine, this.range.endLine),
          [this.range]
        );
      }

      return [];
    }

    const results = [];

    values.forEach(value => {
      value.touch();

      if(!(value instanceof PlainDataValue)) {
        throw new PlainDataError(
          this.context.messages.validation.expectedValuesGotSection(key),
          this.printer.print(value.range.beginLine, value.range.endLine),
          [value.keyRange]
        );
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
            throw new PlainDataError(
              message,
              this.printer.print(value.range.beginLine, value.range.endLine), // TODO: Consider split between .parser and .messages ?
              [value.range]
            );
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
      throw new PlainDataError(
        this.context.messages.validation.exactCountNotMet(key, results.length, options.exactCount),
        this.printer.print(values[0].range.beginLine, values[values.length - 1].range.endLine),
        values.map(value => value.range)
      );
    }

    if(options.minCount !== null && results.length < options.minCount) {
      throw new PlainDataError(
        this.context.messages.validation.minCountNotMet(key, results.length, options.minCount),
        this.printer.print(values[0].range.beginLine, values[values.length - 1].range.endLine),
        values.map(value => value.range)
      );
    }

    if(options.maxCount !== null && results.length > options.maxCount) {
      throw new PlainDataError(
        this.context.messages.validation.maxCountNotMet(key, results.length, options.maxCount),
        this.printer.print(values[0].range.beginLine, values[values.length - 1].range.endLine),
        values.map(value => value.range)
      );
    }

    return results;
  }
}

module.exports = PlainDataSection;
