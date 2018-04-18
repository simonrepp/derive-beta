const { PlainDataError } = require('./errors.js');

class PlainSection {
  constructor(section) {
    this.context = section.context;
    this.depth = section.depth;
    this.key = section.key;
    this.keyRange = section.keyRange;
    this.parent = section.parent;
    this.valueRange = section.valueRange;

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

    if(this.valueRange.beginLine === this.keyRange.beginLine) {
      this.valueRange.beginColumn = 0;
      this.valueRange.beginLine = value.keyRange.beginLine;
    }

    this.valueRange.endColumn = value.valueRange.endColumn;
    this.valueRange.endLine = value.valueRange.endLine;

    this.valuesSequential.push(value);
  }

  list(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key)
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
          this.context.messages.validation.missingKey(key)
        );
      } else {
        return {};
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(value instanceof PlainSection) {
        return value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedSectionGotValue(key),
          this.snippet(value.valueRange),
          [value.keyRange, value.valueRange]
        );
      }
    }

    if(values.length === 0) {
      // TODO: Does this apply?
      if(options.valueRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingValue(key)
        );
      } else {
        return null;
      }
    }

    const ranges = new Set();
    values.forEach(value => {
      ranges.add(value.keyRange);
      ranges.add(value.valueRange);
    });

    throw new PlainDataError(
      this.context.messages.validation.expectedSectionGotList(key),
      [...ranges]
    );
  }

  sections(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key)
        );
      } else {
        return [];
      }
    }

    return values.map(value => {
      if(value instanceof PlainSection) {
        return value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedSectionsGotValue(key),
          [value.keyRange]
        );
      }
    });
  }

  sequential() {
    return this.valuesSequential;
  }

  snippet(range) {
    let snippet = '  Zeile | Inhalt\n';
    snippet +=    '   ...\n';
    let line = Math.max(1, range.beginLine - 2);

    while(line <= Math.min(this.context.lines.length, range.endLine + 2)) {
      const pad = line >= range.beginLine && line <= range.endLine ? ' >     ' : ' ';
      snippet += `${line.toString().padStart(7, pad)} | ${this.context.lines[line - 1]}\n`;
      line++;
    }

    return snippet;
  }

  value(key, options = { keyRequired: true, process: false, required: false }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key)
        );
      } else {
        return null;
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(value.value === null) {
        if(options.required) {
          throw new PlainDataError(
            this.context.messages.validation.missingValue(key),
            this.snippet(value.keyRange),
            [value.valueRange]
          );
        } else {
          return null;
        }
      }

      if(typeof value.value === 'string') {
        if(options.process) {
          try {
            return options.process(value);
          } catch(message) {
            throw new PlainDataError(
              message,
              this.snippet(value.valueRange),
              [value.valueRange]
            );
          }
        } else {
          return value.value;
        }
      }

      throw new PlainDataError(
        this.context.messages.validation.expectedValueGotSection(key),
        [value.keyRange]
      );
    }

    // TODO: This is (here and elsewhere) likely a noop (first confirmation is there), investigate :)
    if(values.length === 0) {
      if(options.required) {
        throw new PlainDataError(
          this.context.messages.validation.missingValue(key),
          lineContext(value.keyRange.beginLine)
          [value.keyRange, value.valueRange]
        );
      } else {
        return null;
      }
    }

    throw new PlainDataError(
      this.context.messages.validation.expectedValueGotList(key),
      values.map(value => value.valueRange)
    );
  }

  values(key, options = { keyRequired: true }) {
    const values = this.valuesAssociative[key];

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(
          this.context.messages.validation.missingKey(key)
        );
      } else {
        return [];
      }
    }

    // TODO: Go to the bottom of this, adapt the data structure so this is cleanly solved :)
    if(values.length === 1 && values[0].value === null) {
      return [];
    }

    return values.map(value => {
      if(typeof value.value === 'string') {
        return value.value;
      } else {
        throw new PlainDataError(
          this.context.messages.validation.expectedValuesGotSection(key),
          [value.keyRange]
        );
      }
    });
  }
}

module.exports = PlainSection;
