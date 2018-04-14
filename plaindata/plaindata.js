// TODO: Parser error coverage!
// TODO: separate buffers for each type (subdocumentBuffer exists, now add arrayBuffer, etc. instead of generic buffer?)
// TODO: Clarify internally to devs as well as externally to users, whether line and beginLine in PlainDataParseError metadata refers to array index (0+ -indexed) or human line reference (1+ -indexed)
//       And possibly have specs that ensure this is actually correctly reflected in the parser implementation for all possible errors
// TODO: i18n of errors

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
const STATE_READ_MULTILINE_STRING = 1;
const STATE_READ_ALTERNATIVE_STRING = 2;
const STATE_READ_EMPTY_OR_ARRAY = 3;
const STATE_READ_ARRAY = 4;

const ALTERNATIVE_STRING_KEY = /^\s*--(?!-)\s*(.+?)\s*$/;
const ALTERNATIVE_STRING_VALUE = /^\s*--(?!-)\s*(.+?)?\s*$/;
const ARRAY_ITEM = /^\s*-(?!-)\s*(.+?)?\s*$/;
const EMPTY_OR_ARRAY = /^\s*(\S|\S.*\S)\s*:\s*$/; // TODO: this should also support http:frufru: keys !
const MULTILINE_STRING_BEGIN = /^(-{3,})\s*(\S|\S.*\S)\s*$/; // TODO: support initial whitespace just everywhere?
const NOOP = /^\s*>|^\s*$/;
const STRING = /^\s*((?:(?!: ).)+)\s*:\s*(\S|\S.*\S)\s*$/;
const SUBDOCUMENT = /^(#{1,3})\s*(\S|\S.*\S)\s*$/; // TODO: should also support support initial whitespace ?

// the whole idea with ignoring whitespace at the begin, end and between relevant tokens is:
// when you write on paper you don't care if something is "a little to the right, left, or whatever"
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

    if(state === STATE_READ_MULTILINE_STRING) {
      if(lineContent.match(buffer.endMultilineString)) {
        // console.log('[multiline string end]', lineContent);
        documentLevel[buffer.key] = buffer.value.length > 0 ? buffer.value.join('\n') : null;
        state = STATE_RESET;
      } else {
        // console.log('[multiline string line]', lineContent);
        buffer.value.push(lineContent);
      }

      continue;
    }

    if(state === STATE_READ_ALTERNATIVE_STRING) {
      if(match = ALTERNATIVE_STRING_VALUE.exec(lineContent)) {
        // console.log('[alternative string value]', lineContent);
        documentLevel[buffer.key] = match[1] || null;
        state = STATE_RESET;

        continue;
      } else {
        const message = `In Zeile ${lineIndex + 1} müsste der Wert des in der vorherigen Zeile begonnenen Schlüssel-Wert-Paares folgen (z.b. "-- Wert"), es wurde aber etwas anderes vorgefunden.`;
        const metadata = {
          beginColumn: 0,
          beginLine: lineIndex - 1,
          column: 0,
          line: lineIndex
        };

        throw new PlainDataParseError(message, metadata);
      }
    }

    if(lineContent.match(NOOP)) {
      // Comment or empty line
      // console.log('[comment or empty line]', lineContent);
      continue;
    }

    if(state === STATE_READ_EMPTY_OR_ARRAY) {
      if(match = ARRAY_ITEM.exec(lineContent)) {
        // Array item
        // console.log('[array item]', lineContent);
        buffer.value = [ match[1] || null ];
        state = STATE_READ_ARRAY;

        continue;
      } else {
        // Empty
        // console.log('[empty]', lineContent);
        documentLevel[buffer.key] = null;
        state = STATE_RESET;
      }
    }

    if(state === STATE_READ_ARRAY) {
      if(match = ARRAY_ITEM.exec(lineContent)) {
        // Array item
        // console.log('[array item]', lineContent);
        buffer.value.push( match[1] || null );

        continue;
      } else {
        // End of array
        // console.log('[end of array]', lineContent);
        documentLevel[buffer.key] = buffer.value;
        state = STATE_RESET;
      }
    }

    if(match = MULTILINE_STRING_BEGIN.exec(lineContent)) {
      // console.log('[multiline string begin]', lineContent);
      buffer = {
        beginLineIndex: lineIndex,
        endMultilineString: new RegExp(`^-{${match[1].length}}\\s*${match[2]}\\s*$`), // TODO: Escape key for regex + space at start possibility
        key: match[2],
        value: []
      };
      state = STATE_READ_MULTILINE_STRING;

      continue;
    }

    if(match = ALTERNATIVE_STRING_KEY.exec(lineContent)) {
      // console.log('[alternative string key]', lineContent);
      buffer = { key: match[1] };
      state = STATE_READ_ALTERNATIVE_STRING;

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


    // TODO: This mechanism (turn into array if twice encountered) should be replicated for other types too, eg. alternative string, array (= with array item value) :D
    if(match = STRING.exec(lineContent)) {
      // console.log('[string]', lineContent);

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

    if(match = EMPTY_OR_ARRAY.exec(lineContent)) {
      // console.log('[empty or array]', lineContent);
      buffer = { key: match[1] };
      state = STATE_READ_EMPTY_OR_ARRAY;

      continue;
    }

    if(lineContent.match(ARRAY_ITEM)) {
      // console.log('[invalid array item]', lineContent);

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

  if(state === STATE_READ_EMPTY_OR_ARRAY) {
    // console.log('[empty]', '(end of document)');
    documentLevel[buffer.key] = null;
    state = STATE_RESET;
  }

  if(state === STATE_READ_ARRAY) {
    // console.log('[end of array]', '(end of document)');
    documentLevel[buffer.key] = buffer.value;
    state = STATE_RESET;
  }

  if(state === STATE_READ_MULTILINE_STRING) {
    const message = `Der mehrzeilige Textblock der in Zeile ${buffer.beginLineIndex + 1} beginnt, wird bis zum Ende des Dokuments nicht beendet. (Die abschliessende Zeile "${lines[buffer.beginLineIndex]}" nach dem Textblock fehlt)`;
    const metadata = {
      beginColumn: 0,
      beginLine: buffer.beginLineIndex,
      column: lines[lines.length - 1].length,
      line: lines.length - 1
    };

    throw new PlainDataParseError(message, metadata);
  }

  if(state === STATE_READ_ALTERNATIVE_STRING) {
    const message = `Das Schlüssel-Wert-Paar dass in der letzten Zeile (#${lineIndex + 1}) begonnen wird, wird nicht beendet; Eine letzte zusätzliche Zeile wie z.b. "-- Wert" würde dies tun.`;
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
