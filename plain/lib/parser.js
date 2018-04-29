// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

const { errors } = require('./message-codes.js');
const { PlainParseError } = require('./errors.js');
const PlainMap = require('./map.js');
const PlainEmpty = require('./empty.js');
const PlainList = require('./list.js');
const PlainSection = require('./section.js');
const PlainValue = require('./value.js');

const STATE_RESET = null;
const STATE_READ_AFTER_KEY = 1;
const STATE_READ_COLLECTION = 2;
const STATE_READ_FIELD = 3;
const STATE_READ_VERBATIM_FIELD = 4;
const STATE_READ_LIST = 5;

const ANY_KEY = /^\s*==(?!=)\s*(\S.*?)\s*$/;
const ATTRIBUTE = /^\s*(?![>\-#|\\*])([^\s=:][^=:]*?)\s*=\s*(.+?)?\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const EMPTY = /^\s*$/;
const FIELD = /^\s*(?![>\-#|\\*])([^\s=:][^=:]*?)\s*:\s*(\S.*?)\s*$/;
const FIELD_APPEND_WITH_SPACE = /^\s*\\\s*(.+?)?\s*$/;
const FIELD_APPEND_WITH_NEWLINE = /^\s*\|\s*(.+?)?\s*$/;
const KEY = /^\s*(?![>\-#|\\*])([^\s=:][^=:]*?)\s*:\s*$/;
const REFERENCE = /^\s*\*(?!\*)\s*([^\s:][^:]*?)\s*$/;
const REFERENCE_VALUE = /^\s*\*(?!\*)\s*([^\s:][^:]*?)\s*:\s*(.+?)?\s*$/;
const REFERENCE_VERBATIM_VALUE = /^\s*\*\*(?!\*)\s*([^\s:][^:]*?)\s*$/;
const SECTION = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;
const VERBATIM_FIELD = /^\s*(-{2,})\s*(\S.*?)\s*$/;

class PlainParser {
  constructor(input, locale) {
    this.lines = input.split(/\r?\n/);
    this.lookupIndex = {};

    this.context = {
      lines: this.lines,
      locale: locale
    };

    this.document = new PlainSection({
      context: this.context,
      depth: 0,
      keyRange: {
        beginColumn: 0,
        beginLine: 0,
        endColumn: 0,
        endLine: 0
      },
      lookupIndex: this.lookupIndex,
      range: {
        beginColumn: 0,
        beginLine: 1,
        endColumn: 0,
        endLine: 1
      }
    });

    this.currentSection = this.document;
  }

  // == Key (syntax)
  //    kkk (ranges)
  anyKey(key) {
    const column = this.lineContent.lastIndexOf(key);

    this.buffer = {
      key: key,
      keyRange: {
        beginColumn: column,
        beginLine: this.lineNumber,
        endColumn: column + key.length,
        endLine: this.lineNumber
      }
    };
  }

  // Key = Value (syntax)
  // kkk   vvvvv (ranges)
  pair(key, value) {
    const keyColumn = this.lineContent.indexOf(key);
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('=') + 1, this.lineContent.length);
    }

    const newValue = new PlainValue({
      keyRange: {
        beginColumn: keyColumn,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      },
      range: {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: value ? valueColumn + value.length : valueColumn,
        endLine: this.lineNumber
      },
      value: value
    });

    this.lookupIndex[this.lineNumber] = newValue;
    this.buffer.map.assign(key, newValue);
  }

  // - Value (syntax)
  // eeeeeee (ranges)
  attributesAndValuesMixed() {
    const errorRange = {
      beginColumn: 0,
      beginLine: this.lineNumber,
      endColumn: this.lineContent.length,
      endLine: this.lineNumber
    };

    throw new PlainParseError(this.context, {
      code: errors.parser.ATTRIBUTES_AND_VALUES_MIXED,
      meta: { line: this.buffer.keyRange.beginLine, key: this.buffer.key },
      printRanges: [[this.currentSection.keyRange.beginLine, this.lineNumber]],
      editorRanges: [errorRange]
    });
  }

  // Key = Value (syntax)
  mapAfterKey() {
    const newMap = new PlainMap({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: this.buffer.keyRange.endColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.buffer.keyRange.endColumn,
        endLine: this.buffer.keyRange.beginLine
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.buffer.keyRange.beginLine] = newMap;
    this.currentSection.append(this.buffer.key, newMap);
    this.buffer.map = newMap;
  }

  // == Key   (syntax)
  //        v (ranges)
  // Key:     (syntax)
  //      v   (ranges)
  empty() {
    const keyBeginLine = this.lines[this.buffer.keyRange.beginLine - 1];
    const valueColumn = Math.min(keyBeginLine.replace(/\s*$/, '').length + 1, keyBeginLine.length);

    const newValue = new PlainEmpty({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: valueColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: valueColumn,
        endLine: this.buffer.keyRange.beginLine
      },
      value: null
    });

    this.lookupIndex[this.buffer.keyRange.beginLine] = newValue;
    this.currentSection.append(this.buffer.key, newValue);
  }

  // anything (syntax)
  // eeeeeeee (ranges)
  invalidLine() {
    const errorRange = {
      beginColumn: 0,
      beginLine: this.lineNumber,
      endColumn: this.lineContent.length,
      endLine: this.lineNumber
    };

    throw new PlainParseError(this.context, {
      code: errors.parser.INVALID_LINE,
      meta: { line: this.lineNumber },
      printRanges: [[this.lineNumber]],
      editorRanges: [errorRange]
    });
  }

  // Key: (syntax)
  // kkk  (ranges)
  key(key) {
    const column = this.lineContent.indexOf(key);

    this.buffer = {
      key: key,
      keyRange: {
        beginColumn: column,
        beginLine: this.lineNumber,
        endColumn: column + key.length,
        endLine: this.lineNumber
      }
    };
  }

  // Key: Value (syntax)
  // kkk  vvvvv (ranges)
  field(key, value) {
    const keyColumn = this.lineContent.indexOf(key);
    const valueColumn = this.lineContent.lastIndexOf(value);

    this.buffer = {
      key: key,
      keyRange: {
        beginColumn: keyColumn,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      },
      lines: [this.lineNumber],
      range: {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: valueColumn + value.length,
        endLine: this.lineNumber
      },
      value: value
    };
  }

  // | Value (syntax)
  //   vvvvv (ranges)
  fieldAppendWithNewline(value) {
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('|') + 1, this.lineContent.length);
    }

    if(this.buffer.value === undefined) {
      this.buffer.lines = [this.lineNumber];
      this.buffer.range = {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: value ? valueColumn + value.length : valueColumn,
        endLine: this.lineNumber
      };
      this.buffer.value = value || '';
    } else {
      this.buffer.lines.push(this.lineNumber);
      this.buffer.range.endColumn = value ? valueColumn + value.length : valueColumn;
      this.buffer.range.endLine = this.lineNumber;
      this.buffer.value += value ? `\n${value}` : '\n';
    }
  }

  // \ Value (syntax)
  //   vvvvv (ranges)
  fieldAppendWithSpace(value) {
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('|') + 1, this.lineContent.length);
    }

    if(this.buffer.value === undefined) {
      this.buffer.lines = [this.lineNumber];
      this.buffer.range = {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: value ? valueColumn + value.length : valueColumn,
        endLine: this.lineNumber
      };
      this.buffer.value = value || '';
    } else {
      this.buffer.lines.push(this.lineNumber);
      this.buffer.range.endColumn = value ? valueColumn + value.length : valueColumn;
      this.buffer.range.endLine = this.lineNumber;
      if(value) {
        this.buffer.value += ` ${value}`;
      }
    }
  }

  fieldEnd() {
    if(this.buffer.value.match(EMPTY)) {
      this.buffer.value = null;
    }

    const newValue = new PlainValue({
      keyRange: this.buffer.keyRange,
      range: this.buffer.range,
      value: this.buffer.value
    });

    for(let indexLine of this.buffer.lines) {
      this.lookupIndex[indexLine] = newValue;
    }

    this.currentSection.append(this.buffer.key, newValue);
  }

  // -- Key (syntax)
  // k...   (ranges)
  verbatimFieldBegin(dashes, key) {
    const keyEscaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    this.buffer = {
      key: key,
      keyRange: {
        beginColumn: 0,
        beginLine: this.lineNumber
      },
      verbatimFieldEndRegex: new RegExp(`^\\s*${dashes}\\s*${keyEscaped}\\s*$`)
    };
  }

  // -- Key  (end syntax)
  //   ...k  (end ranges)
  verbatimFieldEnd() {
    let value, range;
    if(this.lineNumber > this.buffer.keyRange.beginLine + 1) {
      value = this.lines.slice(this.buffer.keyRange.beginLine, this.lineNumber - 1).join('\n');
      range = {
        beginColumn: 0,
        beginLine: this.buffer.keyRange.beginLine + 1,
        endColumn: this.lines[this.lineNumber - 1].length,
        endLine: this.lineNumber - 1
      };
    } else {
      const keyColumn = this.lines[this.buffer.keyRange.beginLine - 1].lastIndexOf(this.buffer.key);
      value = null;
      range = {
        beginColumn: keyColumn + this.buffer.key.length,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: keyColumn + this.buffer.key.length,
        endLine: this.buffer.keyRange.beginLine
      };
    }

    const newValue = new PlainValue({
      keyRange: {
        beginColumn: this.buffer.keyRange.beginColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.lineContent.length,
        endLine: this.lineNumber
      },
      range: range,
      value: value
    });

    this.currentSection.append(this.buffer.key, newValue);

    for(let indexLine = newValue.keyRange.beginLine; indexLine <= newValue.keyRange.endLine; indexLine++) {
      this.lookupIndex[indexLine] = newValue;
    }
  }

  // * Key (syntax)
  // TODO ranges
  reference(key) {
    const keyEscaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    // TODO
    // this.buffer = {
    //   key: key,
    //   keyRange: {
    //     beginColumn: 0,
    //     beginLine: this.lineNumber
    //   },
    //   referenceRegex: new RegExp(`^\\s*::\\s*${keyEscaped}\\s*$`)
    // };
  }

  run() {
    let match;
    let state = STATE_RESET;

    for(this.lineNumber = 1; this.lineNumber <= this.lines.length; this.lineNumber++) {
      this.lineContent = this.lines[this.lineNumber - 1];

      if(state === STATE_READ_VERBATIM_FIELD) {
        if(this.lineContent.match(this.buffer.verbatimFieldEndRegex)) {
          this.verbatimFieldEnd();
          state = STATE_RESET;
        }
        continue;
      }

      if(this.lineContent.match(COMMENT_OR_EMPTY)) {
        continue;
      }

      if(state === STATE_READ_FIELD) {
        if((match = FIELD_APPEND_WITH_NEWLINE.exec(this.lineContent))) {
          this.fieldAppendWithNewline(match[1] || null);
          continue;
        }

        if((match = FIELD_APPEND_WITH_SPACE.exec(this.lineContent))) {
          this.fieldAppendWithSpace(match[1] || null);
          continue;
        }

        this.fieldEnd();

        state = STATE_RESET;
      }

      if(state === STATE_READ_AFTER_KEY ||
         state === STATE_READ_COLLECTION ||
         state === STATE_READ_LIST) {

        if((match = VALUE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            this.valueAfterKey();
            state = STATE_READ_LIST;
          }

          if(state === STATE_READ_LIST) {
            this.value(match[1] || null);
            continue;
          }

          if(state === STATE_READ_COLLECTION) {
            this.attributesAndValuesMixed();
          }
        }

        if((match = ATTRIBUTE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            this.mapAfterKey();
            state = STATE_READ_COLLECTION;
          }

          if(state === STATE_READ_COLLECTION) {
            this.pair(match[1], match[2] || null);
            continue;
          }

          if(state === STATE_READ_LIST) {
            this.attributesAndValuesMixed();
          }
        }

        if((match = FIELD_APPEND_WITH_NEWLINE.exec(this.lineContent))) {
          this.fieldAppendWithNewline(match[1] || null);
          state = STATE_READ_FIELD;
          continue;
        }

        if((match = FIELD_APPEND_WITH_SPACE.exec(this.lineContent))) {
          this.fieldAppendWithSpace(match[1] || null);
          state = STATE_READ_FIELD;
          continue;
        }

        if(state === STATE_READ_AFTER_KEY) {
          this.empty();
        }

        state = STATE_RESET;
      }

      if((match = FIELD.exec(this.lineContent))) {
        this.field(match[1], match[2]);
        state = STATE_READ_FIELD;
        continue;
      }

      if((match = KEY.exec(this.lineContent))) {
        this.key(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = VERBATIM_FIELD.exec(this.lineContent))) {
        this.verbatimFieldBegin(match[1], match[2]);
        state = STATE_READ_VERBATIM_FIELD;
        continue;
      }

      if((match = SECTION.exec(this.lineContent))) {
        this.section(match[1], match[2]);
        continue;
      }

      if((match = ANY_KEY.exec(this.lineContent))) {
        this.anyKey(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = REFERENCE.exec(this.lineContent))) {
        this.reference(match[1]);
        continue;
      }

      if((match = REFERENCE_VALUE.exec(this.lineContent))) {
        // this.reference(match[1]); TODO
        continue;
      }

      if((match = REFERENCE_VERBATIM_VALUE.exec(this.lineContent))) {
        // this.reference(match[1]); TODO
        continue;
      }

      if(this.lineContent.match(VALUE)) {
        this.unexpectedValue();
      }

      this.invalidLine();
    }

    if(state === STATE_READ_AFTER_KEY) {
      this.empty();
    }

    // TODO: Ensure all "wrap up map/list/whatever and commit buffered value to actual Value in section" code is there

    if(state === STATE_READ_FIELD) {
      this.fieldEnd();
    }

    if(state === STATE_READ_VERBATIM_FIELD) {
      this.unterminatedVerbatimField();
    }

    return this.document;
  }

  // # Key (syntax)
  //   kkkv (ranges)
  section(hashes, key) {
    const targetDepth = hashes.length;

    if(targetDepth - this.currentSection.depth > 1) {
      const errorRange = {
        beginColumn: 0,
        beginLine: this.lineNumber,
        endColumn: this.lineContent.length,
        endLine: this.lineNumber
      };

      throw new PlainParseError(this.context, {
        code: errors.parser.HIERARCHY_LAYER_SKIP,
        meta: { line: this.lineNumber, beginLine: this.currentSection.keyRange.beginLine },
        printRanges: [[this.currentSection.keyRange.beginLine, this.lineNumber]],
        editorRanges: [errorRange]
      });
    }

    while(this.currentSection.depth >= targetDepth) {
      this.currentSection = this.currentSection.parent;
    }

    const keyColumn = this.lineContent.lastIndexOf(key);

    const newSection = new PlainSection({
      depth: this.currentSection.depth + 1, // TODO: Automate depth reset in section.append() ?
      keyRange: {
        beginColumn: keyColumn,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      },
      range: {
        beginColumn: keyColumn + key.length,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.lineNumber] = newSection;
    this.currentSection.append(key, newSection);
    this.currentSection = newSection;
  }

  // - Value (syntax)
  // eeeeeee (ranges)
  unexpectedValue() {
    const errorRange = {
      beginColumn: 0,
      beginLine: this.lineNumber,
      endColumn: this.lineContent.length,
      endLine: this.lineNumber
    };

    throw new PlainParseError(this.context, {
      code: errors.parser.UNEXPECTED_VALUE,
      meta: { line: this.lineNumber },
      printRanges: [[this.lineNumber]],
      editorRanges: [errorRange]
    });
  }

  // -- Key (syntax)
  // eeeeee... until end of document (ranges)
  unterminatedVerbatimField() {
    const errorRange = {
      beginColumn: this.buffer.keyRange.beginColumn,
      beginLine: this.buffer.keyRange.beginLine,
      endColumn: this.lines[this.lines.length - 1].length,
      endLine: this.lines.length
    };

    throw new PlainParseError(this.context, {
      code: errors.parser.UNTERMINATED_VERBATIM_FIELD,
      meta: { beginLine: this.buffer.keyRange.beginLine },
      printRanges: [[errorRange.beginLine, errorRange.endLine]],
      editorRanges: [errorRange]
    });
  }

  // - Value (syntax)
  //   vvvvv (ranges)
  value(value) {
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('-') + 1, this.lineContent.length);
    }

    const newValue = new PlainValue({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: value ? valueColumn + value.length : valueColumn,
        endLine: this.lineNumber
      },
      value: value
    });

    this.lookupIndex[this.lineNumber] = newValue;
    this.buffer.list.append(newValue);
  }

  // - Value (syntax)
  valueAfterKey() {
    const newList = new PlainList({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: 0,
        beginLine: this.lineNumber,
        endColumn: this.lineContent.length,
        endLine: this.lineNumber
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.buffer.keyRange.beginLine] = newList;
    this.currentSection.append(this.buffer.key, newList);

    this.buffer.list = newList;
  }
}

module.exports = PlainParser;
