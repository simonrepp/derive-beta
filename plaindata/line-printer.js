class PlainDataLinePrinter {
  constructor(lines, messages) {
    this.lines = lines;

    const contentColumnHeader = messages.printer.content;
    const lineColumnHeader = messages.printer.line.padStart(5);

    this.lineColumnWidth = lineColumnHeader.length + 3;
    this.header = `  ${lineColumnHeader} | ${contentColumnHeader}\n`;
    this.omission = `${' '.repeat(this.lineColumnWidth - 5)}...\n`;
    this.emphasized_omission = ` >${' '.repeat(this.lineColumnWidth - 7)}...\n`
  }

  print(beginLine, endLine) {
    if(!endLine) {
      endLine = beginLine;
    }

    let snippet = this.header;

    let line = Math.max(1, beginLine - 2);

    if(line > 1) {
      snippet += this.omission;
    }

    if(endLine - beginLine > 3) {
      while(line <= beginLine + 1) {
        const content = this.lines[line - 1];
        const lineNumber = line.toString();

        if(line >= beginLine && line <= endLine) {
          snippet += ` >${lineNumber.padStart(this.lineColumnWidth - 3)} | ${content}\n`;
        } else {
          snippet += `${lineNumber.padStart(this.lineColumnWidth - 1)} | ${content}\n`;
        }

        line++;
      }

      snippet += this.emphasized_omission;
      line = endLine - 1;
    }

    while(line <= Math.min(this.lines.length, endLine + 2)) {
      const content = this.lines[line - 1];
      const lineNumber = line.toString();

      if(line >= beginLine && line <= endLine) {
        snippet += ` >${lineNumber.padStart(this.lineColumnWidth - 3)} | ${content}\n`;
      } else {
        snippet += `${lineNumber.padStart(this.lineColumnWidth - 1)} | ${content}\n`;
      }

      line++;
    }

    if(line < this.lines.length) {
      snippet += this.omission;
    }

    return snippet;
  }
}

module.exports = PlainDataLinePrinter;
