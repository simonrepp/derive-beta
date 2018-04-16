const { PlainDataError } = require('./errors.js');

class PlainMap extends Map {
  constructor(locale) {
    super();

    this.messages = require(`./messages/${locale}.js`);
  }

  getList(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new Error(this.messages.validation.missingKey(key));
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
        throw new Error(this.messages.validation.missingKey(key));
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
          this.messages.validation.expectedSectionGotValue(key),
          [value.keyRange, value.valueRange]
        );
      }
    }

    if(values.length === 0) {
      // TODO: Does this apply?
      if(options.valueRequired) {
        throw new Error(this.messages.validation.missingValue(key));
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
      this.messages.validation.expectedSectionGotList(key),
      [...ranges]
    );
  }

  sections(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new Error(this.messages.validation.missingKey(key));
      } else {
        return [];
      }
    }

    return values.map(value => {
      if(typeof value.value !== 'string') {
        return value.value;
      } else {
        throw new PlainDataError(
          this.messages.validation.expectedSectionsGotValue(key),
          [value.keyRange]
        );
      }
    });
  }

  value(key, options = { keyRequired: true, process: false, required: false }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        // TODO: Always throw PlainDataError here and elsewhere
        throw new Error(this.messages.validation.missingKey(key));
      } else {
        return null;
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(value.value === null) {
        if(options.required) {
          throw new PlainDataError(
            this.messages.validation.missingValue(key),
            [value.keyRange, value.valueRange]
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
            throw new PlainDataError(message, [value.keyRange]);
          }
        } else {
          return value.value;
        }
      }

      throw new PlainDataError(
        this.messages.validation.expectedValueGotSection(key),
        [value.keyRange]
      );
    }

    // TODO: This is (here and elsewhere) likely a noop (first confirmation is there), investigate :)
    if(values.length === 0) {
      if(options.required) {
        throw new PlainDataError(
          this.messages.validation.missingValue(key),
          [value.keyRange, value.valueRange]
        );
      } else {
        return null;
      }
    }

    throw new PlainDataError(
      this.messages.validation.expectedValueGotList(key),
      values.map(value => value.valueRange)
    );
  }

  values(key, options = { keyRequired: true }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new Error(this.messages.validation.missingKey(key));
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
          this.messages.validation.expectedValuesGotSection(key),
          [value.keyRange]
        );
      }
    });
  }
}

exports.PlainMap = PlainMap;
