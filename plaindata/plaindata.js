// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

// TODO: Consider (internally) abstracting the parser into a class
//       Especially methods for handling the interesting bits, too long to read now

const { PlainDataParseError } = require('./errors.js');
const PlainSection = require('./section.js');
const PlainValue = require('./value.js');
const snippet = require('./snippet.js');

const SUPPORTED_LOCALES = ['de', 'en'];

const STATE_RESET = null;
const STATE_READ_AFTER_KEY = 1;
const STATE_READ_ATTRIBUTES = 2;
const STATE_READ_MULTILINE_VALUE = 3;
const STATE_READ_VALUES = 4;

const ALTERNATIVE_KEY = /^\s*::(?!:)\s*(\S.*?)\s*$/;
const ATTRIBUTE = /^\s*(?![>\-#])([^=:]+?)\s*=\s*(\S.*?)\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*(?![>\-#])([^=:]+?)\s*:\s*$/;
const KEY_VALUE = /^\s*(?![>\-#])([^=:]+?)\s*:\s*(\S.*?)\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{2,})\s*(\S.*?)\s*$/;
const SECTION = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;

const parse = (input, options = { locale: 'en' }) => {
  if(!SUPPORTED_LOCALES.includes(options.locale)) {
    throw new RangeError(
      'The provided message locale requested through the parser options is ' +
      'not supported. Translation contributions are very welcome and an easy ' +
      'thing to do - only a few easy messages need to be translated!'
    );
  }

  const messageDictionary = require(`./messages/${options.locale}.js`);
  const messages = messageDictionary.parser;

  const lines = input.split(/\r?\n/);

  let state = STATE_RESET;
  let readBuffer;
  let match;

  const parserContext = {
    messages: messageDictionary,
    lines: lines
  };

  const lookupIndex = {};

  const document = new PlainSection({
    context: parserContext,
    depth: 0,
    key: null,
    keyRange: {
      beginColumn: 0,
      beginLine: 1,
      endColumn: 0,
      endLine: 1
    },
    lookupIndex: lookupIndex,
    parent: null,
    range: {
      beginColumn: 0,
      beginLine: 1,
      endColumn: 0,
      endLine: 1
    }
  });

  let currentSection = document;

  for(let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
    const lineContent = lines[lineNumber - 1];

    if(state === STATE_READ_MULTILINE_VALUE) {
      if(lineContent.match(readBuffer.multiLineValueEnd)) {
        // console.log('[multiline value end]', lineContent);

        let value, range;
        if(lineNumber > readBuffer.keyRange.beginLine + 1) {
          value = lines.slice(readBuffer.keyRange.beginLine, lineNumber - 1).join('\n');
          range = {
            beginColumn: 0,
            beginLine: readBuffer.keyRange.beginLine + 1,
            endColumn: lines[lineNumber - 1].length,
            endLine: lineNumber - 1
          };
        } else {
          value = null;
          range = {
            beginColumn: lines[readBuffer.keyRange.beginLine - 1].length,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: lines[readBuffer.keyRange.beginLine - 1].length,
            endLine: readBuffer.keyRange.beginLine
          };
        }

        const newValue = new PlainValue({
          context: parserContext,
          key: readBuffer.key,
          keyRange: {
            beginColumn: readBuffer.keyRange.beginColumn,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: lineContent.length,
            endLine: lineNumber
          },
          range: range,
          value: value
        });

        lookupIndex[lineNumber] = newValue;
        currentSection.add(newValue);

        state = STATE_RESET;
      } else {
        // console.log('[multiline value line]', lineContent);
      }

      continue;
    }

    if(lineContent.match(COMMENT_OR_EMPTY)) {STATE_READ_VALUES
      // console.log('[comment or empty line]', lineContent);
      continue;
    }

    if(state === STATE_READ_AFTER_KEY ||
       state === STATE_READ_ATTRIBUTES ||
       state === STATE_READ_VALUES) {

      if((match = VALUE.exec(lineContent))) {

        if(state === STATE_READ_AFTER_KEY) {
          state = STATE_READ_VALUES;
        }

        if(state === STATE_READ_VALUES) {
          // console.log('[value]', lineContent);
          const value = match[1] || null;
          const valueColumn = value ? lineContent.lastIndexOf(value) :
                                      Math.min(lineContent.indexOf('-') + 1,
                                               lineContent.length);

          const newValue = new PlainValue({
            context: parserContext,
            key: readBuffer.key,
            keyRange: readBuffer.keyRange,
            range: {
              beginColumn: valueColumn,
              beginLine: lineNumber,
              endColumn: value ? valueColumn + value.length : valueColumn,
              endLine: lineNumber
            },
            value: value
          });

          lookupIndex[lineNumber] = newValue;
          currentSection.add(newValue);

          continue;
        }

        if(state === STATE_READ_ATTRIBUTES) {
          const errorRange = {
            beginColumn: 0,
            beginLine: lineNumber,
            endColumn: lineContent.length,
            endLine: lineNumber
          };

          throw new PlainDataParseError(
            messages.attributesAndValuesMixed(readBuffer.keyRange.beginLine, readBuffer.key),
            snippet(lines, currentSection.keyRange.beginLine, lineNumber),
            errorRange
          );
        }
      }

      if((match = ATTRIBUTE.exec(lineContent))) {
        // console.log('[attribute]', lineContent);

        if(state === STATE_READ_AFTER_KEY) {
          const newSection = new PlainSection({
            context: parserContext,
            depth: currentSection.depth + 1,
            key: readBuffer.key,
            keyRange: readBuffer.keyRange,
            parent: currentSection,
            range: {
              beginColumn: readBuffer.keyRange.endColumn,
              beginLine: readBuffer.keyRange.beginLine,
              endColumn: readBuffer.keyRange.endColumn,
              endLine: readBuffer.keyRange.beginLine
            }
          });

          lookupIndex[readBuffer.keyRange.beginLine] = newSection; // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
          currentSection.add(newSection);
          currentSection = newSection;

          state = STATE_READ_ATTRIBUTES;
        }

        if(state === STATE_READ_ATTRIBUTES) {
          const key = match[1];
          const keyColumn = lineContent.indexOf(key);
          const value = match[2];
          const valueColumn = lineContent.lastIndexOf(value);

          const newValue = new PlainValue({
            context: parserContext,
            key: key,
            keyRange: {
              beginColumn: keyColumn,
              beginLine: lineNumber,
              endColumn: keyColumn + key.length,
              endLine: lineNumber
            },
            range: {
              beginColumn: valueColumn,
              beginLine: lineNumber,
              endColumn: valueColumn + value.length,
              endLine: lineNumber
            },
            value: value
          });

          lookupIndex[lineNumber] = newValue;
          currentSection.add(newValue);

          continue;
        }

        if(state === STATE_READ_VALUES) {
          const errorRange = {
            beginColumn: 0,
            beginLine: lineNumber,
            endColumn: lineContent.length,
            endLine: lineNumber
          };

          throw new PlainDataParseError(
            messages.attributesAndValuesMixed(readBuffer.keyRange.beginLine, readBuffer.key),
            snippet(lines, currentSection.keyRange.beginLine, lineNumber),
            errorRange
          );
        }
      }

      if(state === STATE_READ_AFTER_KEY) {
        const keyBeginLine = lines[readBuffer.keyRange.beginLine - 1];
        const valueColumn = Math.min(keyBeginLine.length, keyBeginLine.replace(/\s*$/, '').length + 1);

        const newValue = new PlainValue({
          context: parserContext,
          key: readBuffer.key,
          keyRange: readBuffer.keyRange,
          range: {
            beginColumn: valueColumn,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: valueColumn,
            endLine: readBuffer.keyRange.beginLine
          },
          value: null
        });

        lookupIndex[readBuffer.keyRange.beginLine] = newValue;
        currentSection.add(newValue);
      }

      if(state === STATE_READ_ATTRIBUTES) {
        currentSection = currentSection.parent;
      }

      state = STATE_RESET;
    }

    if((match = KEY_VALUE.exec(lineContent))) {

      // console.log('[key value pair]', lineContent);

      const key = match[1];
      const keyColumn = lineContent.indexOf(key);
      const value = match[2];
      const valueColumn = lineContent.lastIndexOf(value);

      const newValue = new PlainValue({
        context: parserContext,
        key: key,
        keyRange: {
          beginColumn: keyColumn,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        },
        range: {
          beginColumn: valueColumn,
          beginLine: lineNumber,
          endColumn: valueColumn + value.length,
          endLine: lineNumber
        },
        value: value
      });

      lookupIndex[lineNumber] = newValue;
      currentSection.add(newValue);

      continue;
    }

    if((match = KEY.exec(lineContent))) {

      // console.log('[key]', lineContent);

      const key = match[1];
      const column = lineContent.indexOf(key);

      readBuffer = {
        key: key,
        keyRange: {
          beginColumn: column,
          beginLine: lineNumber,
          endColumn: column + key.length,
          endLine: lineNumber
        }
      };

      state = STATE_READ_AFTER_KEY;

      continue;
    }

    if((match = MULTILINE_VALUE_BEGIN.exec(lineContent))) {
      // console.log('[multiline value begin]', lineContent);

      const dashes = match[1];
      const key = match[2];
      const keyEscaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

      readBuffer = {
        key: key,
        keyRange: {
          beginColumn: 0,
          beginLine: lineNumber
        },
        multiLineValueEnd: new RegExp(`^\\s*${dashes}\\s*${keyEscaped}\\s*$`)
      };

      state = STATE_READ_MULTILINE_VALUE;

      continue;
    }

    if((match = ALTERNATIVE_KEY.exec(lineContent))) {
      // console.log('[alternative key]', lineContent);

      const key = match[1];
      const column = lineContent.lastIndexOf(key);

      readBuffer = {
        key: key,
        keyRange: {
          beginColumn: column,
          beginLine: lineNumber,
          endColumn: column + key.length,
          endLine: lineNumber
        }
      };

      state = STATE_READ_AFTER_KEY;

      continue;
    }

    if((match = SECTION.exec(lineContent))) {
      // console.log('[section]', lineContent);

      const targetDepth = match[1].length;
      const key = match[2];
      const keyColumn = lineContent.lastIndexOf(key);

      if(targetDepth - currentSection.depth > 1) {
        const errorRange = {
          beginColumn: 0,
          beginLine: lineNumber,
          endColumn: lineContent.length,
          endLine: lineNumber
        };

        throw new PlainDataParseError(
          messages.hierarchyLayerSkip(lineNumber, currentSection.keyRange.beginLine),
          snippet(lines, currentSection.keyRange.beginLine, lineNumber),
          errorRange
        );
      }

      while(currentSection.depth >= targetDepth) {
        currentSection = currentSection.parent;
      }

      const newSection = new PlainSection({
        context: parserContext,
        depth: currentSection.depth + 1,
        key: key,
        keyRange: {
          beginColumn: keyColumn,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        },
        parent: currentSection,
        range: {
          beginColumn: keyColumn + key.length,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        }
      });

      lookupIndex[lineNumber] = newSection; // TODO: Clean up/expand lookupIndex implementation and concept (e.g. better ranges for null values)
      currentSection.add(newSection);
      currentSection = newSection;

      continue;
    }

    if(lineContent.match(VALUE)) {
      const errorRange = {
        beginColumn: 0,
        beginLine: lineNumber,
        endColumn: lineContent.length,
        endLine: lineNumber
      };

      throw new PlainDataParseError(
        messages.unexpectedValue(lineNumber),
        snippet(lines, lineNumber),
        errorRange
      );
    }

    const errorRange = {
      beginColumn: 0,
      beginLine: lineNumber,
      endColumn: lineContent.length,
      endLine: lineNumber
    };

    throw new PlainDataParseError(
      messages.invalidLine(lineNumber),
      snippet(lines, lineNumber),
      errorRange
    );
  }

  if(state === STATE_READ_AFTER_KEY) {
    // console.log('[end of document while reading after key]');

    const newValue = new PlainValue({
      context: parserContext,
      key: readBuffer.key,
      keyRange: readBuffer.keyRange,
      range: {
        beginColumn: lines[readBuffer.keyRange.beginLine - 1].length,
        beginLine: readBuffer.keyRange.beginLine,
        endColumn: lines[readBuffer.keyRange.beginLine - 1].length,
        endLine: readBuffer.keyRange.beginLine
      },
      value: null
    });

    lookupIndex[readBuffer.keyRange.beginLine] = newValue;
    currentSection.add(newValue);
  }

  if(state === STATE_READ_MULTILINE_VALUE) {
    const errorRange = {
      beginColumn: readBuffer.keyRange.beginColumn,
      beginLine: readBuffer.keyRange.beginLine,
      endColumn: lines[lines.length - 1].length,
      endLine: lines.length
    };

    throw new PlainDataParseError(
      messages.unterminatedMultilineValue(readBuffer.keyRange.beginLine),
      snippet(lines, errorRange.beginLine, errorRange.endLine),
      errorRange
    );
  }

  return document;
};

module.exports = {
  parse: parse,
  PlainDataParseError: PlainDataParseError
};
