// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

const { errors } = require('./message-codes.js');
const { PlainDataParseError } = require('./errors.js');
const PlainDataCollection = require('./collection.js');
const PlainDataList = require('./list.js');
const PlainDataSection = require('./section.js');
const PlainDataValue = require('./value.js');

const STATE_RESET = null;
const STATE_READ_AFTER_KEY = 1;
const STATE_READ_COLLECTION_ATTRIBUTES = 2;
const STATE_READ_MULTILINE_VALUE = 3;
const STATE_READ_LIST_VALUES = 4;

const ANY_KEY = /^\s*==(?!=)\s*(\S.*?)\s*$/;
const ATTRIBUTE = /^\s*(?![>\-#])([^=:]+?)\s*=\s*(.+?)?\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*(?![>\-#])([^=:]+?)\s*:\s*$/;
const KEY_VALUE = /^\s*(?![>\-#])([^=:]+?)\s*:\s*(\S.*?)\s*$/;
const LIST_VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{2,})\s*(\S.*?)\s*$/;
const SECTION = /^\s*(#+)\s*(\S.*?)\s*$/;

// TODO: Consider the == Any key instead of :: Any Key syntax
//
// == Traumhaeuser
// = Erhaeltlich

class PlainDataParser {
  constructor(input, locale) {
    this.lines = input.split(/\r?\n/);
    this.lookupIndex = {};

    this.context = {
      lines: this.lines,
      locale: locale
    };

    this.document = new PlainDataSection({
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

  // :: Key (syntax)
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

  // TODO: Section has fields, collection has attributes ? point out that fields can be text fields and relate to forms in websites
  // TODO: value(key, value) {} -> that's the single explicit value that follows after key somewhere

  // Key = Value (syntax)
  // kkk   vvvvv (ranges)
  attribute(key, value) {
    const keyColumn = this.lineContent.indexOf(key);
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('=') + 1, this.lineContent.length);
    }

    const newValue = new PlainDataValue({
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
    this.buffer.collection.assign(key, newValue);
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

    throw new PlainDataParseError(this.context, {
      code: errors.parser.ATTRIBUTES_AND_VALUES_MIXED,
      meta: { line: this.buffer.keyRange.beginLine, key: this.buffer.key },
      printRanges: [[this.currentSection.keyRange.beginLine, this.lineNumber]],
      editorRanges: [errorRange]
    });
  }

  // Key = Value (syntax)
  collectionAfterKey() {
    const newCollection = new PlainDataCollection({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: this.buffer.keyRange.endColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.buffer.keyRange.endColumn,
        endLine: this.buffer.keyRange.beginLine
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.buffer.keyRange.beginLine] = newCollection;
    this.currentSection.append(this.buffer.key, newCollection);
    this.buffer.collection = newCollection;
  }

  empty() {
    const keyBeginLine = this.lines[this.buffer.keyRange.beginLine - 1];
    const valueColumn = Math.min(keyBeginLine.length, keyBeginLine.replace(/\s*$/, '').length + 1);

    const newValue = new PlainDataValue({
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

  // Key:  (syntax)
  //     v (ranges)
  endOfDocumentAfterKey() {
    const newValue = new PlainDataValue({
      keyRange: this.buffer.keyRange,
      range: {
        beginColumn: this.lines[this.buffer.keyRange.beginLine - 1].length,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.lines[this.buffer.keyRange.beginLine - 1].length,
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

    throw new PlainDataParseError(this.context, {
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

    const newValue = new PlainDataValue({
      keyRange: {
        beginColumn: keyColumn,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      },
      range: {
        beginColumn: valueColumn,
        beginLine: this.lineNumber,
        endColumn: valueColumn + value.length,
        endLine: this.lineNumber
      },
      value: value
    });

    this.lookupIndex[this.lineNumber] = newValue;
    this.currentSection.append(key, newValue);
  }

  // - Value (syntax)
  listAfterKey() {
    const newList = new PlainDataList({
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

  // - Value (syntax)
  //   vvvvv (ranges)
  listValue(value) {
    let valueColumn;

    if(value) {
      valueColumn = this.lineContent.lastIndexOf(value);
    } else {
      valueColumn = Math.min(this.lineContent.indexOf('-') + 1, this.lineContent.length);
    }

    const newValue = new PlainDataValue({
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

  // -- Key (syntax)
  // k...   (ranges)
  multilineValueBegin(dashes, key) {
    const keyEscaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    this.buffer = {
      key: key,
      keyRange: {
        beginColumn: 0,
        beginLine: this.lineNumber
      },
      multiLineValueEnd: new RegExp(`^\\s*${dashes}\\s*${keyEscaped}\\s*$`)
    };
  }

  // -- Key  (end syntax)
  //   ...k  (end ranges)
  multiLineValueEnd() {
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

    const newValue = new PlainDataValue({
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

  run() {
    let match;
    let state = STATE_RESET;

    for(this.lineNumber = 1; this.lineNumber <= this.lines.length; this.lineNumber++) {
      this.lineContent = this.lines[this.lineNumber - 1];

      if(state === STATE_READ_MULTILINE_VALUE) {
        if(this.lineContent.match(this.buffer.multiLineValueEnd)) {
          this.multiLineValueEnd();
          state = STATE_RESET;
        }
        continue;
      }

      if(this.lineContent.match(COMMENT_OR_EMPTY)) {
        // TODO: possibly Remove log lines if checku pafter refactoring works ok without them
        continue;
      }

      if(state === STATE_READ_AFTER_KEY ||
         state === STATE_READ_COLLECTION_ATTRIBUTES ||
         state === STATE_READ_LIST_VALUES) {

        if((match = LIST_VALUE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            this.listAfterKey();
            state = STATE_READ_LIST_VALUES;
          }

          if(state === STATE_READ_LIST_VALUES) {
            this.listValue(match[1] || null);
            continue;
          }

          if(state === STATE_READ_COLLECTION_ATTRIBUTES) {
            this.attributesAndValuesMixed();
          }
        }

        if((match = ATTRIBUTE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            this.collectionAfterKey();
            state = STATE_READ_COLLECTION_ATTRIBUTES;
          }

          if(state === STATE_READ_COLLECTION_ATTRIBUTES) {
            this.attribute(match[1], match[2] || null);
            continue;
          }

          if(state === STATE_READ_LIST_VALUES) {
            this.attributesAndValuesMixed();
          }
        }

        if(state === STATE_READ_AFTER_KEY) {
          this.empty();
        }

        // TODO: Recursive range expansion of parent sections (already happning maybe?) when stuff gets added to children, eg. lists, collections, aso.

        state = STATE_RESET;
      }

      if((match = KEY_VALUE.exec(this.lineContent))) {
        this.field(match[1], match[2]);
        continue;
      }

      if((match = KEY.exec(this.lineContent))) {
        this.key(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = MULTILINE_VALUE_BEGIN.exec(this.lineContent))) {
        this.multilineValueBegin(match[1], match[2]);
        state = STATE_READ_MULTILINE_VALUE;
        continue;
      }

      if((match = ANY_KEY.exec(this.lineContent))) {
        this.anyKey(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = SECTION.exec(this.lineContent))) {
        this.section(match[1], match[2]);
        continue;
      }

      if(this.lineContent.match(LIST_VALUE)) {
        this.unexpectedValue();
      }

      this.invalidLine();
    }

    if(state === STATE_READ_AFTER_KEY) {
      this.endOfDocumentAfterKey();
    }

    if(state === STATE_READ_MULTILINE_VALUE) {
      this.unterminatedMultilineValue();
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

      throw new PlainDataParseError(this.context, {
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

    const newSection = new PlainDataSection({
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

    throw new PlainDataParseError(this.context, {
      code: errors.parser.UNEXPECTED_VALUE,
      meta: { line: this.lineNumber },
      printRanges: [[this.lineNumber]],
      editorRanges: [errorRange]
    });
  }

  // -- Key (syntax)
  // eeeeee... until end of document (ranges)
  unterminatedMultilineValue() {
    const errorRange = {
      beginColumn: this.buffer.keyRange.beginColumn,
      beginLine: this.buffer.keyRange.beginLine,
      endColumn: this.lines[this.lines.length - 1].length,
      endLine: this.lines.length
    };

    throw new PlainDataParseError(this.context, {
      code: errors.parser.UNTERMINATED_MULTILINE_VALUE,
      meta: { beginLine: this.buffer.keyRange.beginLine },
      printRanges: [[errorRange.beginLine, errorRange.endLine]],
      editorRanges: [errorRange]
    });
  }
}

module.exports = PlainDataParser;
