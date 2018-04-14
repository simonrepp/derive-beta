// TODO: Parser error coverage!
// TODO: separate buffers for each type (subdocumentBuffer exists, now add listBuffer, etc. instead of generic buffer?)
// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors

// TODO: Expose i18n of error messages through API
const messages = require('./messages/de.js');

// TODO: Error implementation refinements ? regarding output
class PlainDataParseError extends Error {
  constructor(message, metadata) {
    super(message);

    Object.keys(metadata).forEach(key => {
      this[key] = metadata[key];
    });

    Error.captureStackTrace(this, PlainDataParseError);
  }
}

const STATE_RESET = null;
const STATE_READ_MULTILINE_VALUE = 1;
const STATE_READ_VALUES = 2;

const ALTERNATIVE_KEY = /^\s*--(?!-)\s*(\S.*?)\s*$/;
const COMMENT_OR_EMPTY = /^\s*(>|$)/;
const KEY = /^\s*([^:]+?)\s*:\s*$/;
const KEY_VALUE_PAIR = /^\s*([^:]+?)\s*:\s*(\S.*?)\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{3,})\s*(\S.*?)\s*$/;
const SUBDOCUMENT = /^\s*(#+)\s*(\S.*?)\s*$/;
const VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;

// TODO: Harden e.g. KEY_VALUE regex to be robust for any matching order (?!#>) ...

// the whole idea with ignoring whitespace at the begin, end, between different connected lines and between relevant tokens is:
// when you write on paper you don't care if something is "a little to the right, left, further down or whatever"
// as long as "words" or whatever you write on paper are clearly separated and graspable by their intent,
// everything is fine! So this is how plain data should behave as well because everything else is programmerthink

const parse = input => {
  const lines = input.split('\n'); // TODO: Robust split for all platforms' newline signature
  const documentRoot = {};

  let documentLevel = documentRoot;
  let state = STATE_RESET;
  let buffer;
  let match;

  let parentDocuments = [];
  let subdocumentBuffer = {
    beginLineIndex: 0,
    depth: 0
  };

  for(let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineContent = lines[lineIndex];

    if(state === STATE_READ_MULTILINE_VALUE) {
      if(lineContent.match(buffer.multiLineValueEnd)) {
        // console.log('[multiline value end]', lineContent);
        const value = buffer.value.length > 0 ? buffer.value.join('\n') : null;
        const previousValues = documentLevel[buffer.key];

        if(previousValues === undefined) {
          documentLevel[buffer.key] = value;
        } else {
          if(Array.isArray(previousValues)) {
            previousValues.push(value);
          } else {
            documentLevel[buffer.key] = [previousValues, value];
          }
        }

        state = STATE_RESET;
      } else {
        // console.log('[multiline value line]', lineContent);
        buffer.value.push(lineContent);
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
        const previousValues = documentLevel[buffer.key];

        if(previousValues === undefined) {
          documentLevel[buffer.key] = value;
        } else {
          if(Array.isArray(previousValues)) {
            previousValues.push(value);
          } else {
            documentLevel[buffer.key] = [previousValues, value];
          }
        }

        continue;

      } else {

        if(documentLevel[buffer.key] === undefined) {
          documentLevel[buffer.key] = null;
        }

        state = STATE_RESET;

      }
    }

    if(match = MULTILINE_VALUE_BEGIN.exec(lineContent)) {
      // console.log('[multiline value begin]', lineContent);
      buffer = {
        beginLineIndex: lineIndex,
        multiLineValueEnd: new RegExp(`^\\s*-{${match[1].length}}\\s*${match[2]}\\s*$`), // TODO: Escape key for regex
        key: match[2],
        value: []
      };
      state = STATE_READ_MULTILINE_VALUE;

      continue;
    }

    if(match = ALTERNATIVE_KEY.exec(lineContent)) {
      // console.log('[alternative key]', lineContent);
      buffer = {
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
          currentDepth: subdocumentBuffer.depth,
          currentDepthBeginLine: subdocumentBuffer.beginLineIndex + 1,
          currentDepthBeginLineContent: lines[subdocumentBuffer.beginLineIndex],
          errorLine: lineIndex + 1,
          errorLineContent: lineContent,
          targetDepth: hashesCount
        });

        const metadata = {
          beginColumn: 0,
          beginLine: subdocumentBuffer.beginLineIndex,
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

      subdocumentBuffer = {
        beginLineIndex: lineIndex,
        depth: hashesCount
      };

      continue;
    }

    if(match = KEY_VALUE_PAIR.exec(lineContent)) {

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
      buffer = {
        beginLineIndex: lineIndex,
        key: match[1]
      };
      state = STATE_READ_VALUES;

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

    // TODO: This could actually be not an error state, but just plain and really cool: If it's nothing else, then it's a value! (dangerous though because restrictions - >#- (begin) / : (in between)) nah think again
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
    if(documentLevel[buffer.key] === undefined) {
      documentLevel[buffer.key] = null;
    }
  }

  if(state === STATE_READ_MULTILINE_VALUE) {
    const message = messages.unterminatedMultilineValue({
      multiLineValueBeginLine: buffer.beginLineIndex + 1,
      multiLineValueBeginLineContent: lines[buffer.beginLineIndex]
    });

    const metadata = {
      beginColumn: 0,
      beginLine: buffer.beginLineIndex,
      column: lines[lines.length - 1].length,
      line: lines.length - 1
    };

    throw new PlainDataParseError(message, metadata);
  }

  return documentRoot;
};

module.exports = {
  parse: parse,
  PlainDataParseError: PlainDataParseError
};
