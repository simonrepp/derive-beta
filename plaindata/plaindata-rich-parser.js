// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

const { PlainDataParseError } = require('./errors.js');
const { PlainMap } = require('./structures.js');

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

  const messages = require(`./messages/${options.locale}.js`);

  const lines = input.split(/\r?\n/);

  let state = STATE_RESET;
  let readBuffer;
  let match;

  const root = new PlainMap(options.locale);

  const hierarchy = {
    current: root,
    currentBeginLine: 1,
    currentDepth: 0,
    parents: [],
    root: root
  };

  // TODO: Maps instead of objects because order stability as a bonus

  for(let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
    const lineContent = lines[lineNumber - 1];

    if(state === STATE_READ_MULTILINE_VALUE) {
      if(lineContent.match(readBuffer.multiLineValueEnd)) {
        // console.log('[multiline value end]', lineContent);
        const value = readBuffer.value.length > 0 ? readBuffer.value.join('\n') : null;

        const newValue = {
          keyRange: {
            beginColumn: readBuffer.keyRange.beginColumn,
            beginLine: readBuffer.keyRange.beginLine,
            endColumn: lineContent.length,
            endLine: lineNumber
          },
          value: value,
          valueRange: {
            beginColumn: 0,
            beginLine: readBuffer.keyRange.beginLine + 1,
            endColumn: value ? readBuffer.value[readBuffer.value.length - 1].length : 0,
            endLine: value ? lineNumber - 1 : lineNumber
          }
        };

        const existingValues = hierarchy.current.get(readBuffer.key);

        if(existingValues) {
          existingValues.push(newValue);
        } else {
          hierarchy.current.set(readBuffer.key, [newValue]);
        }

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
          keyRange: readBuffer.keyRange,
          value: value,
          valueRange: {
            beginColumn: valueColumn,
            beginLine: lineNumber,
            endColumn: value ? valueColumn + value.length : valueColumn,
            endLine: lineNumber
          }
        };

        const existingValues = hierarchy.current.get(readBuffer.key);

        if(existingValues) {
          existingValues.push(newValue);
        } else {
          hierarchy.current.set(readBuffer.key, [newValue]);
        }

        continue;

      } else {

        const newValue = {
          keyRange: readBuffer.keyRange,
          value: null,
          valueRange: {
            beginColumn: 0,
            beginLine: readBuffer.keyRange.beginLine + 1,
            endColumn: 0,
            endLine: readBuffer.keyRange.beginLine + 1
          }
        };

        const existingValues = hierarchy.current.get(readBuffer.key);

        if(existingValues) {
          existingValues.push(newValue);
        } else {
          hierarchy.current.set(readBuffer.key, [newValue]);
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

      const existingValues = hierarchy.current.get(key);

      if(existingValues) {
        existingValues.push(newValue);
      } else {
        hierarchy.current.set(key, [newValue]);
      }

      continue;
    }

    if(match = KEY.exec(lineContent)) {

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

      state = STATE_READ_VALUES;

      continue;
    }

    if(match = MULTILINE_VALUE_BEGIN.exec(lineContent)) {
      // console.log('[multiline value begin]', lineContent);

      const dashes = match[1];
      const key = match[2];
      const keyEscaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

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

      if(targetDepth - hierarchy.currentDepth > 1) {
        const message = messages.hierarchyLayerSkip({
          currentDepth: hierarchy.currentDepth,
          currentDepthBeginLine: hierarchy.currentBeginLine,
          currentDepthBeginLineContent: lines[hierarchy.currentBeginLine - 1],
          errorLine: lineNumber,
          errorLineContent: lineContent,
          targetDepth: targetDepth
        });

        const metadata = {
          beginColumn: 0,
          beginLine: hierarchy.currentBeginLine,
          column: 0,
          line: lineNumber
        };

        throw new PlainDataParseError(message, metadata);
      }

      const newValue = {
        keyRange: {
          beginColumn: keyColumn,
          beginLine: lineNumber,
          endColumn: keyColumn + key.length,
          endLine: lineNumber
        },
        value: new PlainMap()

        // TODO: Consider if/how to handle valueRange for sections
        // valueRange: {
        //   beginColumn: valueColumn,
        //   beginLine: lineNumber,
        //   endColumn: valueColumn + value.length,
        //   endLine: lineNumber
        // }
      };

      while(hierarchy.currentDepth >= targetDepth) {
        hierarchy.current = hierarchy.parents.pop();
        hierarchy.currentDepth--;
      }

      const existingValues = hierarchy.current.get(key);

      if(existingValues) {
        existingValues.push(newValue);
      } else {
        hierarchy.current.set(key, [newValue]);
      }

      hierarchy.parents.push(hierarchy.current);
      hierarchy.current = newValue.value;
      hierarchy.currentBeginLine = lineNumber;
      hierarchy.currentDepth = targetDepth;

      continue;
    }

    if(lineContent.match(VALUE)) {

      // console.log('[unexpected value]', lineContent);
      const message = messages.unexpectedValue({
        errorLine: lineNumber,
        errorLineContent: lineContent
      });

      const metadata = {
        beginColumn: 0,
        beginLine: lineNumber,
        column: lineContent.length,
        line: lineNumber
      };

      throw new PlainDataParseError(message, metadata);
    }

    const message = messages.invalidLine({
      errorLine: lineNumber,
      errorLineContent: lineContent
    });

    const metadata = {
      beginColumn: 0,
      beginLine: lineNumber,
      column: lineContent.length,
      line: lineNumber
    };

    throw new PlainDataParseError(message, metadata);
  }

  if(state === STATE_READ_VALUES) {
    // console.log('[end of document while reading values]');

    // TODO: Only add null to values if for this readBuffer we have not written anything yet (may need extra field to remember that)
    if(documentLevel[readBuffer.key] === undefined) {
      documentLevel[readBuffer.key] = null;
    }
  }

  if(state === STATE_READ_MULTILINE_VALUE) {
    const message = messages.unterminatedMultilineValue({
      multiLineValueBeginLine: readBuffer.keyRange.beginLine,
      multiLineValueBeginLineContent: lines[readBuffer.keyRange.beginLine - 1]
    });

    const metadata = {
      beginColumn: 0,
      beginLine: readBuffer.beginLine,
      column: lines[lines.length - 1].length,
      line: lines.length
    };

    throw new PlainDataParseError(message, metadata);
  }

  return hierarchy.root;
};

module.exports = {
  parse: parse,
  PlainDataParseError: PlainDataParseError
};
