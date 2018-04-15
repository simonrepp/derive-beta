// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors
// TODO: Error implementation refinements ? regarding output

class PlainDataOptionError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, PlainDataOptionError);
  }
}

class PlainDataParseError extends Error {
  constructor(message, metadata) {
    super(message);

    Object.keys(metadata).forEach(key => {
      this[key] = metadata[key];
    });

    Error.captureStackTrace(this, PlainDataParseError);
  }
}

const SUPPORTED_LOCALES = ['de', 'en'];

const STATE_RESET = null;
const STATE_READ_MULTILINE_VALUE = 1;
const STATE_READ_VALUES = 2;

const ALTERNATIVE_KEY = /^\s*--(?!-)\s*(\S.*?)\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*([^:]+?)\s*:\s*$/;
const KEY_VALUE = /^\s*(?![>\-#])([^:]+?)\s*:\s*(\S.*?)\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{3,})\s*(\S.*?)\s*$/;
const SUBDOCUMENT = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;

// the whole idea with ignoring whitespace at the begin, end, between different connected lines and between relevant tokens is:
// when you write on paper you don't care if something is "a little to the right, left, further down or whatever"
// as long as "words" or whatever you write on paper are clearly separated and graspable by their intent,
// everything is fine! So this is how plain data should behave as well because everything else is programmerthink

const parse = (input, options = { locale: 'en' }) => {
  if(!SUPPORTED_LOCALES.includes(options.locale)) {
    throw new PlainDataOptionError(
      'The provided message locale requested through the parser options is ' +
      'not supported. Translation contributions are very welcome and an easy ' +
      'thing to do - less than 10 messages need to be translated!'
    );
  }

  const messages = require(`./messages/${options.locale}.js`);
  const lines = input.split(/\r?\n/);
  const documentRoot = {};

  let documentLevel = documentRoot;
  let state = STATE_RESET;
  let keyValueBuffer;
  let match;

  let parentDocuments = [];
  let hierarchyBuffer = {
    beginLineIndex: 0,
    depth: 0
  };

  for(let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineContent = lines[lineIndex];

    if(state === STATE_READ_MULTILINE_VALUE) {
      if(lineContent.match(keyValueBuffer.multiLineValueEnd)) {
        // console.log('[multiline value end]', lineContent);
        const value = keyValueBuffer.value.length > 0 ? keyValueBuffer.value.join('\n') : null;
        const previousValues = documentLevel[keyValueBuffer.key];

        if(previousValues === undefined) {
          documentLevel[keyValueBuffer.key] = value;
        } else {
          if(Array.isArray(previousValues)) {
            previousValues.push(value);
          } else {
            documentLevel[keyValueBuffer.key] = [previousValues, value];
          }
        }

        state = STATE_RESET;
      } else {
        // console.log('[multiline value line]', lineContent);
        keyValueBuffer.value.push(lineContent);
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
        const previousValues = documentLevel[keyValueBuffer.key];

        if(previousValues === undefined) {
          documentLevel[keyValueBuffer.key] = value;
        } else {
          if(Array.isArray(previousValues)) {
            previousValues.push(value);
          } else {
            documentLevel[keyValueBuffer.key] = [previousValues, value];
          }
        }

        continue;

      } else {

        if(documentLevel[keyValueBuffer.key] === undefined) {
          documentLevel[keyValueBuffer.key] = null;
        }

        state = STATE_RESET;

      }
    }

    if(match = KEY_VALUE.exec(lineContent)) {

      // console.log('[key value pair]', lineContent);
      const key = match[1];
      const value = match[2];
      const previousValues = documentLevel[key];

      if(previousValues === undefined) {
        documentLevel[key] = value;
      } else {
        if(Array.isArray(previousValues)) {
          previousValues.push(value);
        } else {
          documentLevel[key] = [previousValues, value];
        }
      }

      continue;
    }

    if(match = KEY.exec(lineContent)) {

      // console.log('[key]', lineContent);
      keyValueBuffer = {
        beginLineIndex: lineIndex,
        key: match[1]
      };
      state = STATE_READ_VALUES;

      continue;
    }

    if(match = MULTILINE_VALUE_BEGIN.exec(lineContent)) {
      // console.log('[multiline value begin]', lineContent);

      const dashes = match[1];
      const key = match[2];
      const keyEscaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

      keyValueBuffer = {
        beginLineIndex: lineIndex,
        multiLineValueEnd: new RegExp(`^\\s*${dashes}\\s*${keyEscaped}\\s*$`),
        key: key,
        value: []
      };

      state = STATE_READ_MULTILINE_VALUE;

      continue;
    }

    if(match = ALTERNATIVE_KEY.exec(lineContent)) {
      // console.log('[alternative key]', lineContent);
      keyValueBuffer = {
        beginLineIndex: lineIndex,
        key: match[1]
      };
      state = STATE_READ_VALUES;

      continue;
    }

    if(match = SUBDOCUMENT.exec(lineContent)) {
      // console.log('[subdocument]', lineContent);

      const hashesCount = match[1].length;
      const key = match[2];

      if(hashesCount - parentDocuments.length > 1) {
        const message = messages.hierarchyLayerSkip({
          currentDepth: hierarchyBuffer.depth,
          currentDepthBeginLine: hierarchyBuffer.beginLineIndex + 1,
          currentDepthBeginLineContent: lines[hierarchyBuffer.beginLineIndex],
          errorLine: lineIndex + 1,
          errorLineContent: lineContent,
          targetDepth: hashesCount
        });

        const metadata = {
          beginColumn: 0,
          beginLine: hierarchyBuffer.beginLineIndex,
          column: 0,
          line: lineIndex
        };

        throw new PlainDataParseError(message, metadata);
      }

      if(parentDocuments.length < hashesCount) {
        // Go one level deeper in the hierarchy
        documentLevel[key] = {};
        parentDocuments.push(documentLevel);
        documentLevel = documentLevel[key];
      } else {
        // Go higher or stay on same level in the hierarchy
        while(parentDocuments.length > hashesCount) {
          parentDocuments.pop();

        }

        documentLevel = parentDocuments.pop();

        if(documentLevel.hasOwnProperty(key)) {
          const appendedDocument = {};

          if(!Array.isArray(documentLevel[key])) {
            documentLevel[key] = [documentLevel[key]];
          }

          documentLevel[key].push(appendedDocument);
          parentDocuments.push(documentLevel);
          documentLevel = appendedDocument;
        } else {
          documentLevel[key] = {};
          parentDocuments.push(documentLevel);
          documentLevel = documentLevel[key];
        }
      }

      hierarchyBuffer = {
        beginLineIndex: lineIndex,
        depth: hashesCount
      };

      continue;
    }

    if(lineContent.match(VALUE)) {

      // console.log('[unexpected value]', lineContent);
      const message = messages.unexpectedValue({
        errorLine: lineIndex + 1,
        errorLineContent: lineContent
      });

      const metadata = {
        beginColumn: 0,
        beginLine: lineIndex,
        column: lineContent.length,
        line: lineIndex
      };

      throw new PlainDataParseError(message, metadata);
    }

    const message = messages.invalidLine({
      errorLine: lineIndex + 1,
      errorLineContent: lineContent
    });

    const metadata = {
      beginColumn: 0,
      beginLine: lineIndex,
      column: lineContent.length,
      line: lineIndex
    };

    throw new PlainDataParseError(message, metadata);
  }

  if(state === STATE_READ_VALUES) {
    // console.log('[end of document while reading values]');
    if(documentLevel[keyValueBuffer.key] === undefined) {
      documentLevel[keyValueBuffer.key] = null;
    }
  }

  if(state === STATE_READ_MULTILINE_VALUE) {
    const message = messages.unterminatedMultilineValue({
      multiLineValueBeginLine: keyValueBuffer.beginLineIndex + 1,
      multiLineValueBeginLineContent: lines[keyValueBuffer.beginLineIndex]
    });

    const metadata = {
      beginColumn: 0,
      beginLine: keyValueBuffer.beginLineIndex,
      column: lines[lines.length - 1].length,
      line: lines.length - 1
    };

    throw new PlainDataParseError(message, metadata);
  }

  return documentRoot;
};

module.exports = {
  parse: parse,
  PlainDataParseError: PlainDataParseError,
  PlainDataOptionError: PlainDataOptionError
};
