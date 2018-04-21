const { strings } = require('./messages/codes.js');

class PlainDataLinePrinter {
  constructor(lines, messages) {
    this.lines = lines;

    const contentColumnHeader = messages[strings.SNIPPET_CONTENT_HEADER];
    const lineColumnHeader = messages[strings.SNIPPET_LINE_HEADER].padStart(5);

    this.lineColumnWidth = lineColumnHeader.length + 3;
    this.header = `  ${lineColumnHeader} | ${contentColumnHeader}\n`;
    this.omission = `${' '.repeat(this.lineColumnWidth - 5)}...\n`;
    this.emphasized_omission = ` >${' '.repeat(this.lineColumnWidth - 7)}...\n`
  }

  print(lineRanges) {
    let snippet = this.header;

    let inOmission = false;

    for(let lineNumber = 1; lineNumber <= this.lines.length; lineNumber++) {
      let print = false;
      let emphasize = false;

      for(let lineRange of lineRanges) {
        const beginLine = lineRange[0];
        const endLine = lineRange.length > 1 ? lineRange[1] : beginLine;

        if(lineNumber >= beginLine - 2 && lineNumber <= beginLine + 2 ||
           lineNumber >= endLine - 2 && lineNumber <= endLine + 2) {
          print = true;
        }

        if(lineNumber >= beginLine && lineNumber <= endLine) {
          emphasize = true;
        }
      }

      if(print) {
        const content = this.lines[lineNumber - 1];
        const lineNumberString = lineNumber.toString();

        if(emphasize) {
          snippet += ` >${lineNumberString.padStart(this.lineColumnWidth - 3)} | ${content}\n`;
        } else {
          snippet += `${lineNumberString.padStart(this.lineColumnWidth - 1)} | ${content}\n`;
        }

        inOmission = false;
      } else {
        if(!inOmission) {
          if(emphasize) {
            snippet += this.emphasized_omission;
          } else {
            snippet += this.omission;
          }

          inOmission = true;
        }
      }
    }

    return snippet;
  }
}

module.exports = PlainDataLinePrinter;
