const { PlainDataError } = require('./errors.js');
const PlainValue = require('./value.js');
const snippet = require('./snippet.js');

class PlainSection {
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
  // TODO: Implement additional options flags
  assertAllTouched(options = { except: [], only: [] }) {
    for(let value of this.valuesSequential) {
      if(!value.touched) {
        throw new PlainDataError(
          this.context.messages.validation.excessKey(value.key),
          snippet(this.context.lines, value.keyRange.beginLine, value.keyRange.endLine),
          [value.keyRange]
        );
      }

      if(value instanceof PlainSection) {
        value.assertAllTouched();
      }
    }
  }

  // TODO: This not used yet, probably needs better usecase/specification
  list(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          snippet(this.context.lines, 0)
        );
      } else {
        return [];
      }
    }

    return values;
  }

  meta(key) {
    return this.valuesAssociative[key][0];
  }

  section(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          snippet(this.context.lines, 0)
        );
      } else {
        return {};
      }
    }

    if(values.length === 1) {
      const value = values[0];

      value.touch();

      if(value instanceof PlainSection) {
        return value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedSectionGotValue(key),
          snippet(this.context.lines, value.range.beginLine, value.range.endLine),
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
      snippet(this.context.lines, values[0].range.beginLine, values[values.length - 1].range.endLine),
      [...ranges]
    );
  }

  sections(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          snippet(this.context.lines, 0)
        );
      } else {
        return [];
      }
    }

    return values.map(value => {
      value.touch();

      if(value instanceof PlainSection) {
        return value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedSectionsGotValue(key),
          snippet(this.context.lines, value.range.beginLine, value.range.endLine),
          [value.range]
        );
      }
    });
  }

  sequential() {
    return this.valuesSequential;
  }

  touch() {
    this.touched = true;
  }

  value(key, options = { keyRequired: true, lazy: false, process: false, required: false }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          snippet(this.context.lines, 0)
        );
      } else {
        return null;
      }
    }

    if(values.length === 1) {
      const value = values[0];

      value.touch();

      if(value instanceof PlainValue) {
        if(value.value === null) {
          if(options.required) {
            throw new PlainDataError(
              this.context.messages.validation.missingValue(key),
              snippet(this.context.lines, value.range.beginLine),
              [value.range]
            );
          } else {
            return options.lazy ? value : value.get();
          }
        }

        if(options.process) {
          try {
            return options.process(value);
          } catch(message) {
            throw new PlainDataError(
              message,
              snippet(this.context.lines, value.range.beginLine, value.range.endLine), // TODO: Consider split between .parser and .messages ?
              [value.range]
            );
          }
        }

        return options.lazy ? value : value.get();
      }

      throw new PlainDataError(
        this.context.messages.validation.expectedValueGotSection(key),
        snippet(this.context.lines, value.range.beginLine, value.range.endLine),
        [value.keyRange]
      );
    }

    // TODO: Ensure all errors are format msg, snippet (!), ranges

    // TODO: Esp. for this usecase below, consider snippet() accepting multiple line ranges too
    throw new PlainDataError(
      this.context.messages.validation.expectedValueGotList(key),
      snippet(this.context.lines, values[0].range.beginLine, values[values.length - 1].range.endLine),
      values.map(value => value.range)
    );
  }

  values(key, options = { keyRequired: true, lazy: false }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key),
          snippet(this.context.lines, 0)
        );
      } else {
        return [];
      }
    }

    // TODO: Go to the bottom of this, possibly adapt the data structure cause this looks hacky :)
    //       Consider that the differentiation between empty list and explicit empty and so on might
    //       look different for sequential than for associative storage
    if(values.length === 1 && values[0].value === null) {
      values[0].touch();

      return [];
    }

    return values.map(value => {
      value.touch();

      if(value instanceof PlainValue) {
        return options.lazy ? value : value.get();
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedValuesGotSection(key),
          snippet(this.context.lines, value.range.beginLine, value.range.endLine),
          [value.keyRange]
        );
      }
    });
  }
}

module.exports = PlainSection;
