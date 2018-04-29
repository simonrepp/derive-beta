// ```name: value
const ESCAPED_UNTERMINATED_NAME = /^\s*(`+)((?:(?!\\1).)+)$/;

class ErrorMatcher {
  interpret(lines, line, lineNumber) {
    if(line.match(ESCAPED_UNTERMINATED_NAME)) {
      throw new AdventureParseError({ lines: lines, locale: 'de' }, {
        code: errors.parser.ESCAPED_UNTERMINATED_NAME,
        meta: { line: lineNumber },
        printRanges: [[lineNumber, lineNumber]]
      });
    }
  }
}

module.exports = ErrorMatcher;

// Use these when the grammar_matcher does not match to
// determine and gradually in development add more fine-grained errors

// if !GRAMMAR_MATCHER.match (line) {
  // if UNTERMINATED_ESCAPE .match(line) => new ParseError(...)

//  you get the picture :)
