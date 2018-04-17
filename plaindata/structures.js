const { PlainDataError } = require('./errors.js');

class PlainMap extends Map {
  constructor(parserContext) {
    super();

    this.parserContext = parserContext;
    this.messages = parserContext.messages.validation;
  }

  getList(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(this.messages.missingKey(key));
      } else {
        return [];
      }
    }

    return values;
  }

  section(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(this.messages.missingKey(key));
      } else {
        return {};
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(typeof value.value !== 'string') {
        return value.value;
      } else {
        throw new PlainDataError(
          this.messages.expectedSectionGotValue(key),
          this.snippet(value.valueRange),
          [value.keyRange, value.valueRange]
        );
      }
    }

    if(values.length === 0) {
      // TODO: Does this apply?
      if(options.valueRequired) {
        throw new PlainDataError(this.messages.missingValue(key));
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
      this.messages.expectedSectionGotList(key),
      [...ranges]
    );
  }

  sections(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(this.messages.missingKey(key));
      } else {
        return [];
      }
    }

    return values.map(value => {
      if(typeof value.value !== 'string') {
        return value.value;
      } else {
        throw new PlainDataError(
          this.messages.expectedSectionsGotValue(key),
          [value.keyRange]
        );
      }
    });
  }

  snippet(range) {
    let snippet = '  Zeile | Inhalt\n';
    snippet +=    '   ...\n';
    let line = Math.max(1, range.beginLine - 2);

    while(line <= Math.min(this.parserContext.lines.length, range.endLine + 2)) {
      const pad = line >= range.beginLine && line <= range.endLine ? ' >     ' : ' ';
      snippet += `${line.toString().padStart(7, pad)} | ${this.parserContext.lines[line - 1]}\n`;
      line++;
    }

    return snippet;
  }

  value(key, options = { keyRequired: true, process: false, required: false }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(this.messages.missingKey(key));
      } else {
        return null;
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(value.value === null) {
        if(options.required) {
          throw new PlainDataError(
            this.messages.missingValue(key),
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
            throw new PlainDataError(message,
                                     this.snippet(value.valueRange),
                                     [value.valueRange]);
          }
        } else {
          return value.value;
        }
      }

      throw new PlainDataError(
        this.messages.expectedValueGotSection(key),
        [value.keyRange]
      );
    }

    // TODO: This is (here and elsewhere) likely a noop (first confirmation is there), investigate :)
    if(values.length === 0) {
      if(options.required) {
        throw new PlainDataError(
          this.messages.missingValue(key),
          lineContext(value.keyRange.beginLine)
          [value.keyRange, value.valueRange]
        );
      } else {
        return null;
      }
    }

    throw new PlainDataError(
      this.messages.expectedValueGotList(key),
      values.map(value => value.valueRange)
    );
  }

  values(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new PlainDataError(this.messages.missingKey(key));
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
          this.messages.expectedValuesGotSection(key),
          [value.keyRange]
        );
      }
    });
  }
}

exports.PlainMap = PlainMap;
