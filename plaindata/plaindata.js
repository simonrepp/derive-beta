// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

const { PlainDataParseError } = require('./errors.js');
const { PlainSection } = require('./structures.js');
const snippet = require('./snippet.js');

const SUPPORTED_LOCALES = ['de', 'en'];

const STATE_RESET = null;
const STATE_READ_MULTILINE_VALUE = 1;
const STATE_READ_VALUES = 2;

const ALTERNATIVE_KEY = /^\s*--(?!-)\s*(\S.*?)\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*([^:]+?)\s*:\s*$/;
const KEY_VALUE = /^\s*(?![>\-#])([^:]+?)\s*:\s*(\S.*?)\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{3,})\s*(\S.*?)\s*$/;
const SECTION = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;

const lineContext = (lines, lineNumber) => {
  const beginIndex = Math.max(0, lineNumber - 3);
  const endIndex = beginIndex + 4;

  return lines.slice(beginIndex, endIndex).join('\n');
};

// the whole idea with ignoring whitespace at the begin, end, between different connected lines and between relevant tokens is:
// when you write on paper you don't care if something is "a little to the right, left, further down or whatever"
// as long as "words" or whatever you write on paper are clearly separated and graspable by their intent,
// everything is fine! So this is how plain data should behave as well because everything else is programmerthink

const parse = (input, options = { locale: 'en' }) => {
  if(!SUPPORTED_LOCALES.includes(options.locale)) {
    throw new RangeError(
      'The provided message locale requested through the parser options is ' +
      'not supported. Translation contributions are very welcome and an easy ' +
      'thing to do - less than 10 messages need to be translated!'
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

  const document = new PlainSection(parserContext, {
    depth: 0,
    key: 'ROOT',
    keyRange: {
      beginColumn: 0,
      beginLine: 1,
      endColumn: 0,
      endLine: 1
    },
    parent: null,
    valueRange: {
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

        let value, valueRange;
        if(readBuffer.value.length > 0) {
          value = readBuffer.value.join('\n');
          valueRange = {
            beginColumn: 0,
            beginLine: readBuffer.keyRange.beginLine + 1,
            endColumn: readBuffer.value[readBuffer.value.length - 1].length,
            endLine: lineNumber - 1
          };
        } else {
          value = null;
          valueRange = {
            beginColumn: lines[readBuffer.keyRange.beginLine - 1].length,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: lines[readBuffer.keyRange.beginLine - 1].length,
            endLine: readBuffer.keyRange.beginLine
          };
        }

        const newValue = {
          key: readBuffer.key,
          keyRange: {
            beginColumn: readBuffer.keyRange.beginColumn,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: lineContent.length,
            endLine: lineNumber
          },
          value: value,
          valueRange: valueRange
        };

        currentSection.add(newValue);

        state = STATE_RESET;
      } else {
        // console.log('[multiline value line]', lineContent);
        readBuffer.value.push(lineContent);
      }

      continue;
    }

    if(lineContent.match(COMMENT_OR_EMPTY)) {
      // Comment or empty line
      // console.log('[comment or empty line]', lineContent);
      continue;
    }

    if(state === STATE_READ_VALUES) {
      if(match = VALUE.exec(lineContent)) {

        // console.log('[value]', lineContent);
        const value = match[1] || null;
        const valueColumn = value ? lineContent.lastIndexOf(value) :
                                    Math.min(lineContent.indexOf('-') + 1,
                                             lineContent.length);

        const newValue = {
          key: readBuffer.key,
          keyRange: readBuffer.keyRange,
          value: value,
          valueRange: {
            beginColumn: valueColumn,
            beginLine: lineNumber,
            endColumn: value ? valueColumn + value.length : valueColumn,
            endLine: lineNumber
          }
        };

        currentSection.add(newValue);

        readBuffer.empty = false;

        continue;

      } else {

        if(readBuffer.empty) {
          const newValue = {
            key: readBuffer.key,
            keyRange: readBuffer.keyRange,
            value: null,
            valueRange: {
              beginColumn: lines[readBuffer.keyRange.beginLine - 1].length,
              beginLine: readBuffer.keyRange.beginLine,
              endColumn: lines[readBuffer.keyRange.beginLine - 1].length,
              endLine: readBuffer.keyRange.beginLine
            }
          };

          currentSection.add(newValue);
        }

        state = STATE_RESET;

      }
    }

    if(match = KEY_VALUE.exec(lineContent)) {

      // console.log('[key value pair]', lineContent);

      const key = match[1];
      const keyColumn = lineContent.indexOf(key);
      const value = match[2];
      const valueColumn = lineContent.lastIndexOf(value);

      const newValue = {
        key: key,
        keyRange: {
          beginColumn: keyColumn,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        },
        value: value,
        valueRange: {
          beginColumn: valueColumn,
          beginLine: lineNumber,
          endColumn: valueColumn + value.length,
          endLine: lineNumber
        }
      };

      currentSection.add(newValue);

      continue;
    }

    if(match = KEY.exec(lineContent)) {

      // console.log('[key]', lineContent);

      const key = match[1];
      const column = lineContent.indexOf(key);

      readBuffer = {
        empty: true,
        key: key,
        keyRange: {
          beginColumn: column,
          beginLine: lineNumber,
          endColumn: column + key.length,
          endLine: lineNumber
        }
      };

      state = STATE_READ_VALUES;

      continue;
    }

    if(match = MULTILINE_VALUE_BEGIN.exec(lineContent)) {
      // console.log('[multiline value begin]', lineContent);

      const dashes = match[1];
      const key = match[2];
      const keyEscaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

      // TODO: Instead of copying line by line to multilineValue readBuffer,
      //       just remember first content line index and then slice it out
      //       from lines[] when we encounter the terminating line?

      readBuffer = {
        key: key,
        keyRange: {
          beginColumn: 0,
          beginLine: lineNumber
        },
        multiLineValueEnd: new RegExp(`^\\s*${dashes}\\s*${keyEscaped}\\s*$`),
        value: []
      };

      state = STATE_READ_MULTILINE_VALUE;

      continue;
    }

    if(match = ALTERNATIVE_KEY.exec(lineContent)) {
      // console.log('[alternative key]', lineContent);

      const key = match[1];
      const column = lineContent.lastIndexOf(key);

      readBuffer = {
        empty: true,
        key: key,
        keyRange: {
          beginColumn: column,
          beginLine: lineNumber,
          endColumn: column + key.length,
          endLine: lineNumber
        }
      };

      state = STATE_READ_VALUES;

      continue;
    }

    if(match = SECTION.exec(lineContent)) {
      // console.log('[subdocument]', lineContent);

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

      const newSection = new PlainSection(parserContext, {
        depth: currentSection.depth + 1,
        key: key,
        keyRange: {
          beginColumn: keyColumn,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        },
        parent: currentSection,
        valueRange: {
          beginColumn: keyColumn + key.length,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        }
      });

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

  if(state === STATE_READ_VALUES) {
    // console.log('[end of document while reading values]');

    if(readBuffer.empty) {
      const newValue = {
        key: readBuffer.key,
        keyRange: readBuffer.keyRange,
        value: null,
        valueRange: {
          beginColumn: 0,
          beginLine: readBuffer.keyRange.beginLine + 1,
          endColumn: 0,
          endLine: readBuffer.keyRange.beginLine + 1
        }
      };

      currentSection.instance.add(newValue);
    }
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
