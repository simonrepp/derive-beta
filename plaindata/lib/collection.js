const { errors } = require('./message-codes.js');
const { PlainDataValidationError } = require('./errors.js');

class PlainDataCollection {
  constructor(collection) {
    this.keyRange = collection.keyRange;
    this.range = collection.range;
    this.touched = false;
    this.attributes = {};
  }

  assign(key, value) {
    value.context = this.context;
    value.key = key;
    value.parent = this;

    const existingValue = this.attributes[key];

    if(existingValue === undefined) {
      this.attributes[key] = value;
    } else {
      throw new PlainDataValidationError(this.context, {
        code: errors.validation.DUPLICATE_ATTRIBUTE_KEY,
        meta: { attributeKey: key, collectionKey: this.key },
        printRanges: [[existingValue.keyRange.beginLine, existingValue.keyRange.endLine], [value.keyRange.beginLine, value.keyRange.endLine]],
        editorRanges: [value.keyRange]
      });
    }

    this.extendRange(value.range.endLine, value.range.endColumn);
  }

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

    const value = this.attributes[key];

    if(value === undefined) {
      if(options.keyRequired) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_ATTRIBUTE,
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

    if(value.value === null) {
      if(options.required) {
        throw new PlainDataValidationError(this.context, {
          code: errors.validation.MISSING_ATTRIBUTE,
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
      return { trace: value, value: value.get() };
    } else {
      return value.get();
    }
  }

  extendRange(line, column) {
    this.range.endColumn = column;
    this.range.endLine = line;

    this.parent.extendRange(line, column);
  }

  raw() {
    const exported = {};

    for(let key of Object.keys(this.attributes)) {
      exported[key] = this.attributes[key].get();
    }

    return exported;
  }

  touch() {
    this.touched = true;
  }
}

module.exports = PlainDataCollection;
