// TODO: Parser error coverage!
// TODO: separate buffers for each type (subdocumentBuffer exists, now add arrayBuffer, etc. instead of generic buffer?)

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
const STATE_READ_EMPTY_OR_ARRAY = 2;
const STATE_READ_ARRAY = 3;

const arrayEntry = /^\s*-\s*(\S|\S.*\S)?\s*$/;
const commentLine = /^\s*>/;
const emptyLine = /^\s*$/;
const emptyOrArray = /^\s*(\S|\S.*\S)\s*:\s*$/; // TODO: this should also support http:frufru: keys !
const beginMultilineString = /^(-{3,})\s*(\S|\S.*\S)\s*$/; // support initial whitespace just everywhere?
const string = /^\s*((?:(?!: ).)+)\s*:\s*(\S|\S.*\S)\s*$/;
const subdocument = /^(#{1,3})\s*(\S|\S.*\S)\s*$/; // TODO: should also support support initial whitespace ?

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

    } else if(state === STATE_READ_EMPTY_OR_ARRAY) {

      if(match = arrayEntry.exec(lineContent)) {

        // Array entry
        // console.log('[array entry]', lineContent);
        buffer.value = [ match.length > 1 ? match[1] : null ];
        state = STATE_READ_ARRAY;

      } else {
        // Empty
        // console.log('[empty]', lineContent);
        documentLevel[buffer.key] = null;
        lineIndex = lineIndex - 1;
        state = STATE_RESET;

      }

    } else if(state === STATE_READ_ARRAY) {

      if(match = arrayEntry.exec(lineContent)) {

        // Array entry
        // console.log('[array entry]', lineContent);
        buffer.value.push( match.length > 1 ? match[1] : null );

      } else {

        // End of array
        // console.log('[end of array]', lineContent);
        documentLevel[buffer.key] = buffer.value;
        lineIndex = lineIndex - 1;
        state = STATE_RESET;

      }

    } else if(state === STATE_RESET) {

      if(lineContent.match(emptyLine)) {

        // console.log('[empty line]', lineContent);

      } else if(lineContent.match(commentLine)) {

        // console.log('[comment line]', lineContent);

      } else if(match = beginMultilineString.exec(lineContent)) {

        // console.log('[multiline string begin]', lineContent);
        buffer = {
          beginLineIndex: lineIndex,
          endMultilineString: new RegExp(`^-{${match[1].length}}\\s*${match[2]}\\s*$`), // TODO: Escape key for regex
          key: match[2],
          value: []
        };
        state = STATE_READ_MULTILINE_STRING;

      } else if(match = subdocument.exec(lineContent)) {

        // console.log('[subdocument]', lineContent);

        const hashesCount = match[1].length;
        const key = match[2];

        if(hashesCount - parentDocuments.length > 1) {

          const message = `In Zeile ${lineIndex + 1} wird eine neue Untersektion des Dokuments begonnen, die zwei Ebenen tiefer (${'#'.repeat(hashesCount)}) liegt als die aktuelle (${'#'.repeat(subdocumentBuffer.depth)}) welche in Zeile ${subdocumentBuffer.beginLineIndex + 1} begonnen wurde, es darf jedoch immer nur eine Untersektion begonnnen werden die maximal eine Ebene tiefer geht.`;
          const metadata = {
            beginColumn: 0,
            beginLine: subdocumentBuffer.beginLineIndex,
            column: 0,
            line: lineIndex + 1
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

      } else if(match = string.exec(lineContent)) {

        // console.log('[string]', lineContent);

        if(documentLevel.hasOwnProperty(match[1])) {
          if(!Array.isArray(documentLevel[match[1]])) {
            documentLevel[match[1]] = [documentLevel[match[1]]];
          }

          documentLevel[match[1]].push(match[2]);
        } else {
          documentLevel[match[1]] = match[2];
        }

      } else if(match = emptyOrArray.exec(lineContent)) {

        // console.log('[empty or array]', lineContent);
        buffer = { key: match[1] };
        state = STATE_READ_EMPTY_OR_ARRAY;

      } else {

        const message = `Die Zeile ${lineIndex + 1} wurde nicht verstanden.`;
        const metadata = {
          beginColumn: 0,
          beginLine: lineIndex,
          column: lineContent.length,
          line: lineIndex
        };

        throw new PlainDataParseError(message, metadata);

      }

    }
  }

  if(state === STATE_READ_MULTILINE_STRING) {
    const message = `Der mehrzeilige Textblock der in Zeile ${buffer.beginLineIndex + 1} beginnt, wird bis zum Ende des Dokuments nicht beendet. (Die abschliessende Zeile "${lines[buffer.beginLineIndex]}" nach dem Textblock fehlt)`;
    const metadata = {
      beginColumn: 0,
      beginLine: buffer.beginLineIndex,
      column: lines[lines.length - 1].length,
      line: lines.length
    };

    throw new PlainDataParseError(message, metadata);
  }

  return documentRoot;
};

module.exports = {
  parse: parse,
  PlainDataParseError: PlainDataParseError
};
