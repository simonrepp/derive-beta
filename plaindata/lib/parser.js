// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

// TODO: Consider (internally) abstracting the parser into a class
//       Especially methods for handling the interesting bits, too long to read now

const { errors } = require('./message-codes.js');
const { PlainDataParseError } = require('./errors.js');
const PlainDataSection = require('./section.js');
const PlainDataValue = require('./value.js');

const STATE_RESET = null;
const STATE_READ_AFTER_KEY = 1;
const STATE_READ_ATTRIBUTES = 2;
const STATE_READ_MULTILINE_VALUE = 3;
const STATE_READ_VALUES = 4;

const ANY_KEY = /^\s*::(?!:)\s*(\S.*?)\s*$/;
const ATTRIBUTE = /^\s*(?![>\-#])([^=:]+?)\s*=\s*(\S.*?)\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*(?![>\-#])([^=:]+?)\s*:\s*$/;
const KEY_VALUE = /^\s*(?![>\-#])([^=:]+?)\s*:\s*(\S.*?)\s*$/;
const LIST_VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{2,})\s*(\S.*?)\s*$/;
const SECTION = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*:(?!:)\s*(.+?)?\s*$/; // Use?! => ': single explicity value syntax'

class PlainDataParser {
  constructor(input, locale) {
    this.lines = input.split(/\r?\n/);
    this.lookupIndex = {};

    this.context = {
      lines: this.lines,
      locale: locale
    };

    // TODO: PlainDataDocument ? (extends PlainDataSection)
    this.document = new PlainDataSection({
      context: this.context,
      depth: 0,
      key: null,
      keyRange: {
        beginColumn: 0,
        beginLine: 1,
        endColumn: 0,
        endLine: 1
      },
      lookupIndex: this.lookupIndex,
      parent: null,
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

  // Key = Value (syntax)
  // kkk   vvvvv (ranges)
  attribute(key, value) {
    const keyColumn = this.lineContent.indexOf(key);
    const valueColumn = this.lineContent.lastIndexOf(value);

    const newValue = new PlainDataValue({
      context: this.context,
      key: key,
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
    this.currentSection.add(newValue);
  }

  // Key = Value (syntax)
  attributeAfterKey() {
    const newSection = new PlainDataSection({
      context: this.context,
      depth: this.currentSection.depth + 1,
      key: this.buffer.key,
      keyRange: this.buffer.keyRange,
      parent: this.currentSection,
      range: {
        beginColumn: this.buffer.keyRange.endColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.buffer.keyRange.endColumn,
        endLine: this.buffer.keyRange.beginLine
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.buffer.keyRange.beginLine] = newSection;
    this.currentSection.add(newSection);
    this.currentSection = newSection;
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

  empty() {
    const keyBeginLine = this.lines[this.buffer.keyRange.beginLine - 1];
    const valueColumn = Math.min(keyBeginLine.length, keyBeginLine.replace(/\s*$/, '').length + 1);

    const newValue = new PlainDataValue({
      context: this.context,
      key: this.buffer.key,
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
    this.currentSection.add(newValue);
  }

  // Key:  (syntax)
  //     v (ranges)
  endOfDocumentAfterKey() {
    const newValue = new PlainDataValue({
      context: this.context,
      key: this.buffer.key,
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
    this.currentSection.add(newValue);
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
  keyValue(key, value) {
    const keyColumn = this.lineContent.indexOf(key);
    const valueColumn = this.lineContent.lastIndexOf(value);

    const newValue = new PlainDataValue({
      context: this.context,
      key: key,
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
    this.currentSection.add(newValue);
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
      context: this.context,
      key: this.buffer.key,
      keyRange: {
        beginColumn: this.buffer.keyRange.beginColumn,
        beginLine: this.buffer.keyRange.beginLine,
        endColumn: this.lineContent.length,
        endLine: this.lineNumber
      },
      range: range,
      value: value
    });

    this.lookupIndex[this.lineNumber] = newValue;
    this.currentSection.add(newValue);
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
      context: this.context,
      key: this.buffer.key,
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
    this.currentSection.add(newValue);
  }

  run() {
    let match;
    let state = STATE_RESET;

    for(this.lineNumber = 1; this.lineNumber <= this.lines.length; this.lineNumber++) {
      this.lineContent = this.lines[this.lineNumber - 1];

      if(state === STATE_READ_MULTILINE_VALUE) {
        if(this.lineContent.match(this.buffer.multiLineValueEnd)) {
          // console.log('[multiline value end]', this.lineContent);
          this.multiLineValueEnd();
          state = STATE_RESET;
        }
        continue;
      }

      if(this.lineContent.match(COMMENT_OR_EMPTY)) {
        // TODO: possibly Remove log lines if checku pafter refactoring works ok without them
        // console.log('[comment or empty line]', this.lineContent);
        continue;
      }

      if(state === STATE_READ_AFTER_KEY ||
         state === STATE_READ_ATTRIBUTES ||
         state === STATE_READ_VALUES) {

        if((match = LIST_VALUE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            // TODO: new ast says this.listAfterKey() i guess
            state = STATE_READ_VALUES;
          }

          if(state === STATE_READ_VALUES) {
            // console.log('[value]', this.lineContent);
            this.listValue(match[1] || null);
            continue;
          }

          if(state === STATE_READ_ATTRIBUTES) {
            this.attributesAndValuesMixed();
          }
        }

        if((match = ATTRIBUTE.exec(this.lineContent))) {
          if(state === STATE_READ_AFTER_KEY) {
            this.attributeAfterKey();
            state = STATE_READ_ATTRIBUTES;
          }

          if(state === STATE_READ_ATTRIBUTES) {
            // console.log('[attribute]', this.lineContent);
            this.attribute(match[1], match[2]);
            continue;
          }

          if(state === STATE_READ_VALUES) {
            this.attributesAndValuesMixed();
          }
        }

        if(state === STATE_READ_AFTER_KEY) {
          this.empty();
        }

        if(state === STATE_READ_ATTRIBUTES) {
          this.currentSection = this.currentSection.parent;
        }

        state = STATE_RESET;
      }

      if((match = KEY_VALUE.exec(this.lineContent))) {
        // console.log('[key value pair]', this.lineContent);
        this.keyValue(match[1], match[2]);
        continue;
      }

      if((match = KEY.exec(this.lineContent))) {
        // console.log('[key]', this.lineContent);
        this.key(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = MULTILINE_VALUE_BEGIN.exec(this.lineContent))) {
        // console.log('[multiline value begin]', this.lineContent);
        this.multilineValueBegin(match[1], match[2]);
        state = STATE_READ_MULTILINE_VALUE;
        continue;
      }

      if((match = ANY_KEY.exec(this.lineContent))) {
        // console.log('[any key]', this.lineContent);
        this.anyKey(match[1]);
        state = STATE_READ_AFTER_KEY;
        continue;
      }

      if((match = SECTION.exec(this.lineContent))) {
        // console.log('[section]', this.lineContent);
        this.section(match[1], match[2]);
        continue;
      }

      if(this.lineContent.match(LIST_VALUE)) {
        this.unexpectedValue();
      }

      this.invalidLine();
    }

    if(state === STATE_READ_AFTER_KEY) {
      // console.log('[end of document while reading after key]');
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
      context: this.context,
      depth: this.currentSection.depth + 1,
      key: key,
      keyRange: {
        beginColumn: keyColumn,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      },
      parent: this.currentSection,
      range: {
        beginColumn: keyColumn + key.length,
        beginLine: this.lineNumber,
        endColumn: keyColumn + key.length,
        endLine: this.lineNumber
      }
    });

    // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
    this.lookupIndex[this.lineNumber] = newSection;
    this.currentSection.add(newSection);
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
