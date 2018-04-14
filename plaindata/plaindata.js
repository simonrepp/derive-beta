// TODO: Parser error coverage!
// TODO: separate buffers for each type (subdocumentBuffer exists, now add listBuffer, etc. instead of generic buffer?)
// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors




// TODO: i18n of errors

// DO IT. :)





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

const STATE_RESET = 0;
const STATE_READ_MULTILINE_VALUE = 1;
const STATE_READ_ALTERNATIVE_VALUE_OR_LIST = 2;
const STATE_READ_EMPTY_OR_LIST = 3;
const STATE_READ_LIST = 4;

const ALTERNATIVE_KEY = /^\s*--(?!-)\s*(\S.*?)\s*$/;
const ALTERNATIVE_VALUE = /^\s*--(?!-)\s*(.+?)?\s*$/;
const LIST_VALUE = /^\s*-(?!-)\s*(.+?)?\s*$/;
const KEY = /^\s*(.+?)\s*:\s*$/;
const MULTILINE_VALUE_BEGIN = /^\s*(-{3,})\s*(\S.*?)\s*$/;
const NOOP = /^\s*(>|$)/;
const KEY_VALUE_PAIR = /^\s*([^:]+?)\s*:\s*(\S.*?)\s*$/;
const SUBDOCUMENT = /^\s*(#+)\s*(\S.*?)\s*$/;

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
        documentLevel[buffer.key] = buffer.value.length > 0 ? buffer.value.join('\n') : null;
        state = STATE_RESET;
      } else {
        // console.log('[multiline value line]', lineContent);
        buffer.value.push(lineContent);
      }

      continue;
    }

    if(lineContent.match(NOOP)) {
      // Comment or empty line
      // console.log('[comment or empty line]', lineContent);
      continue;
    }

    if(state === STATE_READ_ALTERNATIVE_VALUE_OR_LIST) {
      if(match = ALTERNATIVE_VALUE.exec(lineContent)) {
        // console.log('[alternative value]', lineContent);
        documentLevel[buffer.key] = match[1] || null;
        state = STATE_RESET;

        continue;
      }

      if(match = LIST_VALUE.exec(lineContent)) {
        // console.log('[list value]', lineContent);
        buffer.value = [ match[1] || null ];
        state = STATE_READ_LIST;

        continue;
      }

      const message = `In Zeile ${lineIndex + 1} müsste auf den zuvor in Zeile ${buffer.beginLineIndex + 1} genannten Schlüssel "${buffer.key}" ein einzelner Wert (z.b. "-- blau") oder ein Listeneintrag (z.b. "- Apfel") folgen, es wurde aber etwas anderes vorgefunden.`;
      const metadata = {
        beginColumn: 0,
        beginLine: lineIndex - 1,
        column: 0,
        line: lineIndex
      };

      throw new PlainDataParseError(message, metadata);
    }

    if(state === STATE_READ_EMPTY_OR_LIST) {
      if(match = LIST_VALUE.exec(lineContent)) {
        // List item
        // console.log('[list item]', lineContent);
        buffer.value = [ match[1] || null ];
        state = STATE_READ_LIST;

        continue;
      } else {
        // Empty
        // console.log('[empty]', lineContent);
        documentLevel[buffer.key] = null;
        state = STATE_RESET;
      }
    }

    if(state === STATE_READ_LIST) {
      if(match = LIST_VALUE.exec(lineContent)) {
        // List item
        // console.log('[list item]', lineContent);
        buffer.value.push( match[1] || null );

        continue;
      } else {
        // End of list
        // console.log('[end of list]', lineContent);
        documentLevel[buffer.key] = buffer.value;
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
      // console.log('[alternative value key]', lineContent);
      buffer = {
        beginLineIndex: lineIndex,
        key: match[1]
      };
      state = STATE_READ_ALTERNATIVE_VALUE_OR_LIST;

      continue;
    }

    if(match = SUBDOCUMENT.exec(lineContent)) {
      // console.log('[subdocument]', lineContent);

      const hashesCount = match[1].length;
      const key = match[2];

      if(hashesCount - parentDocuments.length > 1) {

        const message = `In Zeile ${lineIndex + 1} wird eine neue Untersektion des Dokuments begonnen, die zwei Ebenen tiefer (${'#'.repeat(hashesCount)}) liegt als die aktuelle (${'#'.repeat(subdocumentBuffer.depth)}) welche in Zeile ${subdocumentBuffer.beginLineIndex + 1} begonnen wurde, es darf jedoch immer nur eine Untersektion begonnnen werden die maximal eine Ebene tiefer geht.`;
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


    // TODO: This mechanism (turn into list if twice encountered) should be replicated for other types too, eg. alternative value, list (= with list item value) :D
    if(match = KEY_VALUE_PAIR.exec(lineContent)) {
      // console.log('[key value pair]', lineContent);

      if(documentLevel.hasOwnProperty(match[1])) {
        if(!Array.isArray(documentLevel[match[1]])) {
          documentLevel[match[1]] = [documentLevel[match[1]]];
        }

        documentLevel[match[1]].push(match[2]);
      } else {
        documentLevel[match[1]] = match[2];
      }

      continue;
    }

    if(match = KEY.exec(lineContent)) {
      // console.log('[empty or list]', lineContent);
      buffer = { key: match[1] };
      state = STATE_READ_EMPTY_OR_LIST;

      continue;
    }

    if(lineContent.match(LIST_VALUE)) {
      // console.log('[invalid list item]', lineContent);

      const message = `Die Zeile ${lineIndex + 1} enthält einen Listeneintrag, ohne dass in einer der Zeilen davor eine Liste begonnen wurde.`;
      const metadata = {
        beginColumn: 0,
        beginLine: lineIndex,
        column: lineContent.length,
        line: lineIndex
      };

      throw new PlainDataParseError(message, metadata);
    }

    const message = `Die Zeile ${lineIndex + 1} wurde nicht verstanden.`;
    const metadata = {
      beginColumn: 0,
      beginLine: lineIndex,
      column: lineContent.length,
      line: lineIndex
    };

    throw new PlainDataParseError(message, metadata);
  }

  if(state === STATE_READ_EMPTY_OR_LIST) {
    // console.log('[empty]', '(end of document)');
    documentLevel[buffer.key] = null;
    state = STATE_RESET;
  }

  if(state === STATE_READ_LIST) {
    // console.log('[end of list]', '(end of document)');
    documentLevel[buffer.key] = buffer.value;
    state = STATE_RESET;
  }

  if(state === STATE_READ_MULTILINE_VALUE) {
    const message = `Der mehrzeilige Textblock der in Zeile ${buffer.beginLineIndex + 1} beginnt, wird bis zum Ende des Dokuments nicht beendet. (Die abschliessende Zeile "${lines[buffer.beginLineIndex]}" nach dem Textblock fehlt)`;
    const metadata = {
      beginColumn: 0,
      beginLine: buffer.beginLineIndex,
      column: lines[lines.length - 1].length,
      line: lines.length - 1
    };

    throw new PlainDataParseError(message, metadata);
  }

  if(state === STATE_READ_ALTERNATIVE_VALUE_OR_LIST) {
    const message = `Das Schlüssel-Wert-Paar dass in der letzten Zeile (#${lineIndex + 1}) begonnen wird, wird nicht beendet; Eine letzte zusätzliche Zeile wie z.b. "-- Wert" oder ein Listeneintrag wie "- Wert" würde dies tun.`;
    const metadata = {
      beginColumn: 0,
      beginLine: lines.length - 2,
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
