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

    return values.map(value => value.value);
  }

  getSection(key, options = { keyRequired: true }) {
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

  getValue(key, options = { keyRequired: true, valueRequired: false }) {
    const values = super.get(key);

    if(values === undefined) {
      if(options.keyRequired) {
        throw new Error(this.messages.validation.missingKey(key));
      } else {
        return null;
      }
    }

    if(values.length === 1) {
      const value = values[0];

      if(typeof value.value === 'string') {
        return value.value;
      } else {
        throw new PlainDataError(
          this.messages.validation.expectedValueGotSection(key),
          [value.keyRange]
        );
      }
    }

    if(values.length === 0) {
      if(options.valueRequired) {
        throw new Error(this.messages.validation.missingValue(key));
      } else {
        return null;
      }
    }

    throw new PlainDataError(
      this.messages.validation.expectedValueGotList(key),
      values.map(value => value.valueRange)
    );
  }
}

exports.PlainMap = PlainMap;
