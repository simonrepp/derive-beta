// TODO: Localize Zeile | Inhalt

const HEADER =              '  Zeile | Inhalt\n';
const OMISSION =            '   ...\n';
const PADDING =             '        ';
const EMPHASIZED =          ' >      ';
const EMPHASIZED_OMISSION = ' > ...\n';

module.exports = (lines, beginLine, endLine) => {
  if(!endLine) {
    endLine = beginLine;
  }

  let snippet = HEADER;

  let line = Math.max(1, beginLine - 2);

  if(line > 1) {
    snippet += OMISSION;
  }

  if(endLine - beginLine > 3) {
    while(line <= beginLine + 1) {
      const pad = line >= beginLine && line <= endLine ? EMPHASIZED : PADDING;
      snippet += `${line.toString().padStart(7, pad)} | ${lines[line - 1]}\n`;
      line++;
    }

    snippet += EMPHASIZED_OMISSION;
    line = endLine - 1;
  }

  while(line <= Math.min(lines.length, endLine + 2)) {
    const pad = line >= beginLine && line <= endLine ? EMPHASIZED : PADDING;
    snippet += `${line.toString().padStart(7, pad)} | ${lines[line - 1]}\n`;
    line++;
  }

  if(line < lines.length) {
    snippet += OMISSION;
  }

  return snippet;
};
